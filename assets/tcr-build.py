# TCR Advanced SL stand-in built from the side photo (base.png, 1200x900).
# Units = the web viewer's units: wheel centres at Z=0, tyre outer radius 1.085, X centred between axles.
# Blender -Y is the drive side (it becomes +Z in glTF, the side the viewer camera faces).
#
# Connection map (all joints overlap ≥ 0.01 via metaball blending or explicit embedding):
#   top tube ends  <-> seat cluster blob / head tube         (metaball family "Upper"/"Lower" overlap)
#   seat & chain stays <-> rear dropout blobs at the axle   (embedded 0.03)
#   fork blades    <-> crown blob under the head tube        (embedded)
#   hub axle       <-> dropouts                             (passes through)
#   seatpost/saddle, stem/bars embed into mast / head tube top
import bpy, bmesh, math, sys
from mathutils import Vector
S=218.5; AX=600.5; AY=577.0   # photo px per unit, from the M geometry: 980 mm wheelbase = 679 px
def P(px,py,y=0.0): return Vector(((px-AX)/S, y, (AY-py)/S))
def R(px): return px/S

bpy.ops.wm.read_factory_settings(use_empty=True)
scn=bpy.context.scene
def mat(name,rgb,rough=.5,metal=0.):
  m=bpy.data.materials.new(name);m.use_nodes=True;b=m.node_tree.nodes['Principled BSDF']
  b.inputs['Base Color'].default_value=(*rgb,1);b.inputs['Roughness'].default_value=rough;b.inputs['Metallic'].default_value=metal;return m
M={k:mat(k,c,r,mt) for k,c,r,mt in [('zone_upper',(.6,.6,.62),.4,0),('zone_lower',(.6,.6,.62),.4,0),('zone_fork',(.6,.6,.62),.4,0),
   ('black',(.015,.017,.02),.85,0),('dark',(.03,.035,.04),.5,.2),('alloy',(.35,.37,.38),.35,.8),('rubber',(.02,.02,.022),.95,0),('tape',(.03,.035,.04),.8,0),('saddle',(.02,.021,.023),.7,0)]}
def link(obj,m):
  obj.data.materials.clear();obj.data.materials.append(M[m]);return obj

# ---------- frame: real M-size geometry (giant-bicycles.com/tw TCR Advanced SL 0-Red 2027) ----------
# BB origin, mm, x forward, z up, -y drive side. Stack 545 / reach 388, HA 73°, SA 73.5°, HT 145, CS 405, BB drop 70,
# wheelbase 980, fork offset 45, tyre 700x28. Tube sections (a = half-size in the side plane, b = half-width) are read
# from the gallery close-ups (D1–D6, Front, Rear).
U=1.085/342.0                       # units per mm: tyre outer radius 342 mm → 1.085 units
XC=(-398.9+581.1)/2
def G(x,z,y=0.0): return Vector(((x-XC)*U, y*U, (z-70)*U))
TUBES=[ # zone, [(x,z,y,a,b), ...]  a/b in mm
 ('upper',[(-118,447,0,19,20),(60,472,0,19,19),(300,500,0,22,22),(392,515,0,31,28)]),               # top tube, flares into the head tube
 ('upper',[(-110,432,10,9,8),(-250,270,40,8,7),(-398,82,66,9,8)]),                                    # seat stays (drive side mirrored below)
 ('upper',[(-110,432,-10,9,8),(-250,270,-40,8,7),(-398,82,-66,9,8)]),
 ('lower',[(372,562,0,24,20),(388,545,0,26,22),(430,406,0,32,27),(437,383,0,33,29)]),                  # head tube (tapered, stem-integrated top)
 ('lower',[(420,440,0,30,30),(300,330,0,32,30),(150,170,0,34,31),(30,35,0,40,36)]),                    # down tube, wide aero section
 ('lower',[(-196,690,0,17,15),(-150,560,0,20,17),(-120,455,0,22,18),(-60,220,0,26,20),(-5,25,0,30,24)]), # mast + seat tube (integrated seatpost)
 ('lower',[(0,0,-43,30,24),(0,0,43,30,24)]),                                                           # BB86 shell
 ('lower',[(-10,0,-38,18,14),(-200,40,-58,17,11),(-398,70,-66,11,8)]),                                # chain stays (drive side taller)
 ('lower',[(-10,0,38,15,12),(-200,40,58,13,10),(-398,70,66,10,8)]),
 ('fork', [(437,380,0,30,46),(445,350,0,26,44)]),                                                      # crown
 ('fork', [(442,365,-36,20,11),(500,230,-50,18,10),(578,78,-58,11,9)]),                               # blades, aero chord in the side plane
 ('fork', [(442,365,36,20,11),(500,230,50,18,10),(578,78,58,11,9)]),
]
def loft(name,pts,seg=20):
  me=bpy.data.meshes.new(name);ob=bpy.data.objects.new(name,me);scn.collection.objects.link(ob);bm=bmesh.new();rings=[]
  P3=[G(x,z,y) for x,z,y,a,b in pts]
  # densify with Catmull-Rom so long tubes bend smoothly
  dense=[]
  for i in range(len(P3)-1):
    p0,p1,p2,p3=P3[max(i-1,0)],P3[i],P3[i+1],P3[min(i+2,len(P3)-1)]
    for k in range(8):
      t=k/8;t2=t*t;t3=t2*t
      p=0.5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t2+(-p0+3*p1-3*p2+p3)*t3)
      a=pts[i][3]+(pts[i+1][3]-pts[i][3])*t;b=pts[i][4]+(pts[i+1][4]-pts[i][4])*t;dense.append((p,a*U,b*U))
  dense.append((P3[-1],pts[-1][3]*U,pts[-1][4]*U))
  for i,(p,a,b) in enumerate(dense):
    t=(dense[min(i+1,len(dense)-1)][0]-dense[max(i-1,0)][0]).normalized()
    u=t.cross(Vector((0,1,0)));u=u.normalized() if u.length>1e-4 else Vector((1,0,0));v=u.cross(t).normalized()
    rings.append([bm.verts.new(p+u*math.cos(q)*a+v*math.sin(q)*b) for q in [2*math.pi*k/seg for k in range(seg)]])
  for r0,r1 in zip(rings,rings[1:]):
    for k in range(seg):bm.faces.new([r0[k],r0[(k+1)%seg],r1[(k+1)%seg],r1[k]])
  bm.faces.new(list(reversed(rings[0])));bm.faces.new(rings[-1]);bm.to_mesh(me);bm.free();return ob,[d[0] for d in dense]
parts=[];skel=[]
for k,(zone,pts) in enumerate(TUBES):
  ob,line=loft(f'T{k}',pts);parts.append(ob);skel+= [(zone,a,b) for a,b in zip(line,line[1:])]
# one watertight shell with filleted junctions: voxel remesh, then relax
bpy.ops.object.select_all(action='DESELECT')
for o in parts:o.select_set(True)
bpy.context.view_layer.objects.active=parts[0];bpy.ops.object.join();frame_ob=parts[0];frame_ob.name='Frame'
r=frame_ob.modifiers.new('rm','REMESH');r.mode='VOXEL';r.voxel_size=2.6*U;r.adaptivity=0.0
sm=frame_ob.modifiers.new('sm','SMOOTH');sm.iterations=6;sm.factor=0.5
for m in ('rm','sm'):bpy.ops.object.modifier_apply(modifier=m)
# paint zones are assigned on the dense remeshed surface (each face takes the nearest tube centreline), so the zone border
# follows a smooth line; the border vertices are then kept out of the decimation so the edge doesn't turn into a sawtooth.
for nm in ('zone_upper','zone_lower','zone_fork'):frame_ob.data.materials.append(M[nm])
ZI={'upper':0,'lower':1,'fork':2}
def segd(p,a,b):
  ab=b-a;t=max(0,min(1,(p-a).dot(ab)/max(ab.length_squared,1e-9)));return (a+ab*t-p).length
def zone_at(p):return ZI[min(skel,key=lambda s:segd(p,s[1],s[2]))[0]]
me=frame_ob.data
vz=[zone_at(v.co) for v in me.vertices]
for poly in me.polygons:
  zs=[vz[k] for k in poly.vertices];poly.material_index=max(set(zs),key=zs.count)
border=set()
for poly in me.polygons:
  if len({vz[k] for k in poly.vertices})>1:border.update(poly.vertices)
# widen the protected band by one ring
ring=set()
for poly in me.polygons:
  if border.intersection(poly.vertices):ring.update(poly.vertices)
border|=ring
vg=frame_ob.vertex_groups.new(name='inner');vg.add([v.index for v in me.vertices if v.index not in border],1.0,'REPLACE')
dec=frame_ob.modifiers.new('dec','DECIMATE');dec.ratio=0.11;dec.vertex_group='inner';dec.vertex_group_factor=1.0
bpy.context.view_layer.objects.active=frame_ob;bpy.ops.object.modifier_apply(modifier='dec')
upper=lower=fork=frame_ob
# ---------- generic sweep (no rotations): circle/ellipse rings along a polyline ----------
def sweep(name,pts,radii,matname,seg=16,cap=True):
  me=bpy.data.meshes.new(name);ob=bpy.data.objects.new(name,me);scn.collection.objects.link(ob);bm=bmesh.new();rings=[]
  for i,p in enumerate(pts):
    t=(pts[min(i+1,len(pts)-1)]-pts[max(i-1,0)]).normalized()
    up=Vector((0,0,1)) if abs(t.z)<.95 else Vector((1,0,0));u=t.cross(up).normalized();v=t.cross(u).normalized();r=radii[i]
    rings.append([bm.verts.new(p+u*math.cos(a)*r+v*math.sin(a)*r) for a in [2*math.pi*k/seg for k in range(seg)]])
  for a,b in zip(rings,rings[1:]):
    for k in range(seg): bm.faces.new([a[k],a[(k+1)%seg],b[(k+1)%seg],b[k]])
  if cap:
    bm.faces.new(list(reversed(rings[0])));bm.faces.new(rings[-1])
  bm.to_mesh(me);bm.free();return link(ob,matname)

def disc(name,c,r,w,matname,seg=48,inner=0.0):
  # a short cylinder (or ring) whose axis is world Y, built directly
  me=bpy.data.meshes.new(name);ob=bpy.data.objects.new(name,me);scn.collection.objects.link(ob);bm=bmesh.new()
  def ring(rad,y): return [bm.verts.new((c.x+rad*math.cos(2*math.pi*k/seg),c.y+y,c.z+rad*math.sin(2*math.pi*k/seg))) for k in range(seg)]
  if inner<=0:
    a,b=ring(r,-w/2),ring(r,w/2)
    for k in range(seg): bm.faces.new([a[k],a[(k+1)%seg],b[(k+1)%seg],b[k]])
    bm.faces.new(list(reversed(a)));bm.faces.new(b)
  else:
    ao,bo,ai,bi=ring(r,-w/2),ring(r,w/2),ring(inner,-w/2),ring(inner,w/2)
    for k in range(seg):
      n=(k+1)%seg
      for f in ([ao[k],ao[n],bo[n],bo[k]],[bi[k],bi[n],ai[n],ai[k]],[ai[k],ai[n],ao[n],ao[k]],[bo[k],bo[n],bi[n],bi[k]]): bm.faces.new(f)
  bm.to_mesh(me);bm.free();return link(ob,matname)

def torus_y(name,c,R0,r0,matname,maj=72,mi=12,sy=1.0):
  me=bpy.data.meshes.new(name);ob=bpy.data.objects.new(name,me);scn.collection.objects.link(ob);bm=bmesh.new();g=[]
  for i in range(maj):
    a=2*math.pi*i/maj;ca,sa=math.cos(a),math.sin(a);row=[]
    for j in range(mi):
      b=2*math.pi*j/mi;rr=R0+r0*math.cos(b);row.append(bm.verts.new((c.x+rr*ca,c.y+r0*sy*math.sin(b),c.z+rr*sa)))
    g.append(row)
  for i in range(maj):
    for j in range(mi): bm.faces.new([g[i][j],g[(i+1)%maj][j],g[(i+1)%maj][(j+1)%mi],g[i][(j+1)%mi]])
  bm.to_mesh(me);bm.free();return link(ob,matname)

# ---------- wheels ----------
for tag,(ax,ay),hw in [('Rear',(261,576),0.225),('Front',(940,578),0.16)]:
  c=P(ax,ay)
  torus_y(tag+'Tyre',c,1.012,0.042,'rubber',sy=1.0)
  disc(tag+'Rim',c,0.975,0.08,'black',seg=96,inner=0.85)        # 40 mm deep carbon rim
  disc(tag+'Hub',c,0.045,hw*2,'dark',seg=24)
  for s in (-1,1): disc(tag+f'Flange{s}',c+Vector((0,s*hw*0.62,0)),0.075,0.015,'dark',seg=24)
  n=24
  for k in range(n):
    a=2*math.pi*(k+.5*(k%2))/n;s=-1 if k%2 else 1
    h=c+Vector((0.07*math.cos(a),s*hw*0.62,0.07*math.sin(a)));rim=c+Vector((0.875*math.cos(a+(.08 if k%2 else -.08)),0,0.875*math.sin(a+(.08 if k%2 else -.08))))
    sweep(f'{tag}Spoke{k}',[h,rim],[0.006,0.006],'black',seg=4,cap=False)
  # disc brake rotor on the non-drive side (+Y)
  disc(tag+'Rotor',c+Vector((0,hw*0.85,0)),0.235 if tag=='Front' else 0.215,0.01,'alloy',seg=48,inner=0.13)

# ---------- drivetrain (drive side, -Y) ----------
bb=P(540,620)
disc('Chainring',bb+Vector((0,-0.20,0)),0.315,0.018,'dark',seg=64,inner=0.2)
disc('Spider',bb+Vector((0,-0.215,0)),0.2,0.02,'alloy',seg=32,inner=0.07)
disc('BBAxle',bb,0.05,0.48,'dark',seg=20)
for s,end in ((-1,P(655,625)),(1,P(425,615))):
  sweep('Crank'+str(s),[bb+Vector((0,s*0.24,0)),end+Vector((0,s*0.24,0))],[0.045,0.035],'black',seg=10)
  disc('Pedal'+str(s),end+Vector((0,s*0.33,0)),0.05,0.16,'black',seg=12)
cas=P(261,576)+Vector((0,-0.17,0))
for i,r in enumerate([0.21,0.19,0.17,0.15,0.13,0.11,0.09]): disc(f'Cog{i}',cas+Vector((0,0.016*i,0)),r,0.008,'alloy',seg=40)
for zt,zb in [((540,555),(261,530)),((540,690),(261,620))]:
  sweep('Chain'+str(zt[1]),[P(*zt,y=-0.2),P(*zb,y=-0.17)],[0.012,0.012],'dark',seg=6)
sweep('RearDerailleur',[P(258,600,y=-0.2),P(250,660,y=-0.21),P(262,690,y=-0.21)],[0.035,0.04,0.03],'black',seg=10)
sweep('FrontDerailleur',[P(505,525,y=-0.14),P(522,548,y=-0.15)],[0.04,0.03],'black',seg=10)
# brake calipers
for name,c in [('RearCaliper',P(306,545,y=0.2)),('FrontCaliper',P(920,540,y=0.15))]:
  sweep(name,[c+Vector((-.06,0,.02)),c+Vector((.06,0,-.02))],[0.045,0.045],'black',seg=10)

# ---------- cockpit ----------
sweep('Seatpost',[P(402,170),P(396,118)],[R(11),R(10)],'black',seg=14)   # integrated-seatpost topper

# ---------- Contact SLR (TRI) saddle: 245 x 145 mm, pressure-relief channel, 9 mm carbon rails ----------
# outline traced from the top-view product photo; local mm: x rear→nose 0..245, y lateral, z up (shell top ≈ +9)
def saddle():
  cu=bpy.data.curves.new('SaddleCurve','CURVE');cu.dimensions='2D';cu.fill_mode='BOTH'
  cu.extrude=3.5;cu.bevel_depth=5.5;cu.bevel_resolution=4;cu.resolution_u=10
  half=[(0,0),(2,30),(10,58),(28,71),(55,72),(85,63),(115,47),(145,34),(175,29),(205,28),(228,24),(240,14),(245,0)]
  outer=[(x,y) for x,y in half]+[(x,-y) for x,y in reversed(half[1:-1])]
  hole=[(30,0),(40,9),(90,11),(150,9),(205,6),(214,0),(205,-6),(150,-9),(90,-11),(40,-9)]
  for loop in (outer,hole):
    sp=cu.splines.new('POLY' if False else 'BEZIER');sp.bezier_points.add(len(loop)-1);sp.use_cyclic_u=True
    for bp,(x,y) in zip(sp.bezier_points,loop):bp.co=(x,y,0);bp.handle_left_type=bp.handle_right_type='AUTO'
  ob=bpy.data.objects.new('SaddleShell',cu);scn.collection.objects.link(ob)
  bpy.context.view_layer.update()
  me=bpy.data.meshes.new_from_object(ob.evaluated_get(bpy.context.evaluated_depsgraph_get()));bpy.data.objects.remove(ob)
  for v in me.vertices:
    x,y,z=v.co
    # crown across the width, kick-up at the tail, slight droop at the nose
    z+=-0.0021*y*y+max(0,30-x)*0.16-max(0,x-200)*0.07
    v.co=(x,y,z)
  shell=bpy.data.objects.new('SaddleShell',me);scn.collection.objects.link(shell);link(shell,'saddle')
  bpy.context.view_layer.objects.active=shell;d_=shell.modifiers.new('d','DECIMATE');d_.ratio=0.45;bpy.ops.object.modifier_apply(modifier='d')
  bm_=bmesh.new();bm_.from_mesh(shell.data);bmesh.ops.remove_doubles(bm_,verts=bm_.verts,dist=0.05);bmesh.ops.recalc_face_normals(bm_,faces=bm_.faces);bm_.to_mesh(shell.data);bm_.free()
  rails=[]
  for s_ in (-1,1):
    pts=[(16,28,-4),(38,30,-20),(75,21,-27),(150,21,-27),(192,15,-20),(222,9,-4)]
    rails.append([(x,s_*y,z) for x,y,z in pts])
  return shell,rails
shell,rails=saddle()
# place: rail clamp sits on the topper, nose at photo x 470 px, top ≈ photo y 95 px
SX,SZ=-330.0,772.0     # BB-mm position of the saddle's local origin (tail, rail-clamp height + 27)
for v in shell.data.vertices:
  x,y,z=v.co;v.co=G(SX+x,SZ+z,y)
for k,r in enumerate(rails):
  sweep(f'SaddleRail{k}',[G(SX+x,SZ+z,y) for x,y,z in r],[4.5*U]*len(r),'dark',seg=10)
sweep('RailClamp',[G(SX+95,SZ-30,0),G(SX+135,SZ-30,0)],[13*U,13*U],'black',seg=12)

# ---------- Contact SLR 0 Aero integrated bar (M: 440 x 100, -10°): drop 125, reach 72, flare 7.3°, sweep 6.5° ----------
HA=math.radians(73)
ST=(379.0,578.0)                                   # steerer top / stem clamp (BB mm), just above the head tube
fwd=(math.cos(math.radians(7)),math.sin(math.radians(7)))   # stem: -10° to the steerer normal = 7° above horizontal
BC=(ST[0]+100*fwd[0],ST[1]+100*fwd[1])              # bar centre
def Bp(dx,dy,dz): return G(BC[0]+dx,BC[1]+dz,dy)   # bar-local mm → units (y lateral)
def loft2(name,pts,matname,seg=18):
  # pts: (point, a = half chord along the travel-normal in the horizontal plane, b = half thickness)
  me=bpy.data.meshes.new(name);ob=bpy.data.objects.new(name,me);scn.collection.objects.link(ob);bm=bmesh.new();rings=[]
  for i,(p,a,b) in enumerate(pts):
    t=(pts[min(i+1,len(pts)-1)][0]-pts[max(i-1,0)][0]).normalized()
    w=t.cross(Vector((0,0,1)));w=w.normalized() if w.length>.2 else Vector((1,0,0)) if abs(t.x)<.9 else Vector((0,1,0))
    n=w.cross(t).normalized()
    rings.append([bm.verts.new(p+w*math.cos(q)*a+n*math.sin(q)*b) for q in [2*math.pi*k/seg for k in range(seg)]])
  for r0,r1 in zip(rings,rings[1:]):
    for k in range(seg):bm.faces.new([r0[k],r0[(k+1)%seg],r1[(k+1)%seg],r1[k]])
  bm.faces.new(list(reversed(rings[0])));bm.faces.new(rings[-1]);bm.to_mesh(me);bm.free();return link(ob,matname)
def catmull(ctrl,n=6):
  out=[]
  for i in range(len(ctrl)-1):
    c0,c1,c2,c3=ctrl[max(i-1,0)],ctrl[i],ctrl[i+1],ctrl[min(i+2,len(ctrl)-1)]
    for k in range(n):
      t=k/n;t2=t*t;t3=t2*t
      f=lambda a,b,c,d:0.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t2+(-a+3*b-3*c+d)*t3)
      out.append(tuple(f(c0[j],c1[j],c2[j],c3[j]) for j in range(len(c1))))
  out.append(ctrl[-1]);return out
cockpit=[]
for side in (-1,1):
  # (dx, dy, dz, half chord, half thickness): flat aero tops → round bend → drops flaring to 440 mm
  ctrl=[(0,0,0,24,8),(4,60,0,23,7),(14,140,0,21,7),(30,172,-2,15,11),(58,190,-20,12,12),(70,197,-55,12,12),
        (58,204,-95,12,12),(28,212,-122,12,12),(-25,220,-127,12,12),(-75,220,-127,12,12)]
  pts=[(Bp(dx,side*dy,dz),a*U,b*U) for dx,dy,dz,a,b in catmull(ctrl)]
  cockpit.append(loft2(f'Bar{side}',pts,'black'))
  tape=[(Bp(dx,side*dy,dz),(a+1.6)*U,(b+1.6)*U) for dx,dy,dz,a,b in catmull(ctrl[4:])]
  loft2(f'Tape{side}',tape,'tape')
  # SRAM-style hood on the bend, lever blade down in front of the drop
  hood=[(Bp(dx,side*dy,dz),a*U,b*U) for dx,dy,dz,a,b in catmull([(50,186,-2,14,14),(80,192,8,16,19),(115,195,18,15,18),(142,196,27,10,12),(152,196,25,6,7)],4)]
  loft2(f'Hood{side}',hood,'black',seg=16)
  lever=[(Bp(dx,side*dy,dz),a*U,b*U) for dx,dy,dz,a,b in catmull([(152,197,14,6,9),(160,201,-35,5,8),(156,205,-85,5,7),(146,207,-118,4,6)])]
  loft2(f'Lever{side}',lever,'dark',seg=10)
# stem: aero D-section from the steerer to the bar centre, Y-shaped below the bar in front view
stem=[(G(ST[0]-6,ST[1]+4),19*U,17*U),(G(ST[0]+30*fwd[0],ST[1]+30*fwd[1]),17*U,20*U),(G(ST[0]+80*fwd[0],ST[1]+80*fwd[1]),15*U,18*U),(Bp(0,0,0),12*U,22*U)]
cockpit.append(loft2('Stem',stem,'black'))
cockpit.append(sweep('TopCap',[G(ST[0]+4,ST[1]-6),G(ST[0]-4,ST[1]+22)],[20*U,19*U],'black',seg=20))
cockpit.append(sweep('Spacer',[G(ST[0]+12,ST[1]-40),G(ST[0]+3,ST[1]-8)],[21*U,21*U],'black',seg=20))
# one piece with fillets, like the carbon part
bpy.ops.object.select_all(action='DESELECT')
for o in cockpit:o.select_set(True)
bpy.context.view_layer.objects.active=cockpit[0];bpy.ops.object.join();cp=cockpit[0];cp.name='Cockpit'
r=cp.modifiers.new('rm','REMESH');r.mode='VOXEL';r.voxel_size=1.5*U
sm=cp.modifiers.new('sm','SMOOTH');sm.iterations=4;sm.factor=0.5
dc=cp.modifiers.new('dc','DECIMATE');dc.ratio=0.06
bpy.context.view_layer.objects.active=cp
for m in ('rm','sm','dc'):bpy.ops.object.modifier_apply(modifier=m)
# ---------- finish: smooth, decimate frame, report ----------
for ob in scn.collection.objects:
  if ob.type!='MESH':continue
  for p in ob.data.polygons: p.use_smooth=True
tris=0
for ob in scn.collection.objects:
  if ob.type=='MESH':tris+=sum(len(p.vertices)-2 for p in ob.data.polygons)
print('OBJECTS',len(scn.collection.objects),'TRIS',tris)
for ob in (frame_ob,):
  vs=[ob.matrix_world@v.co for v in ob.data.vertices];print(ob.name,len(vs),'X',round(min(v.x for v in vs),3),round(max(v.x for v in vs),3),'Y',round(min(v.y for v in vs),3),round(max(v.y for v in vs),3),'Z',round(min(v.z for v in vs),3),round(max(v.z for v in vs),3))

out=sys.argv[sys.argv.index('--')+1]
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.select_all(action='DESELECT');frame_ob.select_set(True);bpy.context.view_layer.objects.active=frame_ob
bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.separate(type='MATERIAL');bpy.ops.object.mode_set(mode='OBJECT')
for o in scn.collection.objects:
  if o.type=='MESH' and o.name.startswith('Frame'):
    used=sorted({p.material_index for p in o.data.polygons});mat0=o.data.materials[used[0]];o.data.materials.clear();o.data.materials.append(mat0)
for o_ in scn.collection.objects:
  if o_.type=='MESH':
    bm_=bmesh.new();bm_.from_mesh(o_.data);bmesh.ops.recalc_face_normals(bm_,faces=bm_.faces);bm_.to_mesh(o_.data);bm_.free()
# merge each material into one mesh so the viewer gets a few named meshes (zone_* drive the paint)
bpy.ops.object.select_all(action='DESELECT')
groups={}
for ob in list(scn.collection.objects):
  if ob.type=='MESH':groups.setdefault(ob.data.materials[0].name,[]).append(ob)
for name,obs in groups.items():
  bpy.ops.object.select_all(action='DESELECT')
  for o in obs:o.select_set(True)
  bpy.context.view_layer.objects.active=obs[0];bpy.ops.object.join();obs[0].name=name;obs[0].data.name=name
# bake ambient occlusion into a vertex colour so the web viewer gets contact darkening without a post-process pass
scn.render.engine='CYCLES';scn.cycles.samples=48;scn.cycles.device='CPU'
scn.world=bpy.data.worlds.new('w');scn.world.color=(1,1,1)
for ob in [o for o in scn.collection.objects if o.type=='MESH']:
  ca=ob.data.color_attributes.new('AO','BYTE_COLOR','POINT');ob.data.color_attributes.active_color=ca
  bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.context.view_layer.objects.active=ob
  bpy.ops.object.bake(type='AO',target='VERTEX_COLORS')
print('AO baked')
bpy.ops.object.select_all(action='SELECT')
for o in bpy.context.selected_objects:
  if o.type!='MESH':o.select_set(False)
bpy.ops.export_scene.gltf(filepath=out+'/tcr.glb',export_format='GLB',use_selection=True,export_apply=True,export_normals=True,export_texcoords=False,export_materials='EXPORT',export_draco_mesh_compression_enable=False,export_vertex_color='ACTIVE',export_all_vertex_colors=False)
# preview renders
scn.render.engine='BLENDER_WORKBENCH';scn.display.shading.light='STUDIO';scn.display.shading.color_type='MATERIAL'
scn.render.film_transparent=True
cam=bpy.data.objects.new('cam',bpy.data.cameras.new('cam'));scn.collection.objects.link(cam);scn.camera=cam
# ortho camera that reproduces the photo's pixel mapping (1200x900, 212 px per unit)
cam.data.type='ORTHO';cam.data.ortho_scale=1200/S;scn.render.resolution_x=1200;scn.render.resolution_y=900
cam.location=((600-AX)/S,-20,(AY-450)/S);cam.rotation_euler=(math.pi/2,0,0)
scn.render.filepath=out+'/ortho.png';bpy.ops.render.render(write_still=True)
cam.data.type='PERSP';cam.data.lens=50;scn.render.resolution_x=1200;scn.render.resolution_y=800;scn.render.film_transparent=False
for name,loc,tg in [('q34',(6,-11,2.5),(0,0,.2)),('front',(12,0,0.8),(0,0,.2)),('cockpit',(3.2,-2.2,2.6),(1.25,0,1.6)),('cockpitF',(4.2,0,2.1),(1.25,0,1.55)),('saddle',(0.2,-2.0,3.0),(-0.97,0,2.2)),('saddleT',(-0.9,-0.01,4.2),(-0.97,0,2.2))]:
  cam.location=loc;d=Vector(tg)-Vector(loc);cam.rotation_euler=d.to_track_quat('-Z','Y').to_euler()
  scn.render.filepath=out+f'/preview-{name}.png';bpy.ops.render.render(write_still=True)
print('DONE')
