import numpy as np
from PIL import Image,ImageFilter
im=np.asarray(Image.open('base.png').convert('RGB')).astype(np.float32)
H,W,_=im.shape
R,G,B=im[...,0],im[...,1],im[...,2]
L=0.299*R+0.587*G+0.114*B
mx=im.max(-1);mn=im.min(-1);sat=(mx-mn)/np.maximum(mx,1)
# tubes: (zone, x1,y1,x2,y2, half-width)
T=[('upper',468,314,818,256,20),   # top tube
   ('upper',452,322,262,552,14),   # seat stays
   ('lower',402,150,458,300,15),   # seat mast
   ('lower',458,300,566,600,26),   # seat tube
   ('lower',822,250,848,345,24),   # head tube (starts below the stem)
   ('lower',838,300,600,592,30),   # down tube
   ('lower',562,606,275,576,24),   # chain stays
   ('lower',798,280,814,294,16),   # top tube / head tube / down tube junction
   ('fork',832,300,930,570,19)]    # fork blade
def gblur(a,sig):
  r=int(sig*3);k=np.exp(-0.5*(np.arange(-r,r+1)/sig)**2);k/=k.sum()
  a=np.apply_along_axis(lambda v:np.convolve(v,k,'same'),0,a)
  return np.apply_along_axis(lambda v:np.convolve(v,k,'same'),1,a)
yy,xx=np.mgrid[0:H,0:W].astype(np.float32)
def segdist(x1,y1,x2,y2):
  dx,dy=x2-x1,y2-y1;t=np.clip(((xx-x1)*dx+(yy-y1)*dy)/(dx*dx+dy*dy),0,1)
  return np.hypot(xx-(x1+t*dx),yy-(y1+t*dy))
D=np.stack([segdist(*t[1:5])-t[5] for t in T])  # signed distance beyond half-width
near=D.min(0); idx=D.argmin(0)
inside=near<3
dw=255-L
cover=np.clip(dw/30,0,1)            # 0 on white background, 1 on pearl
notdark=np.clip((L-70)/40,0,1)      # black parts (cables, chain, crank) drop out
# local contrast: the chain and the caliper are busy, the paint is smooth
def box(a,r):
  c=np.cumsum(np.cumsum(np.pad(a,((r+1,r),(r+1,r)),mode='edge'),0),1)
  return (c[2*r+1:,2*r+1:]-c[:-2*r-1,2*r+1:]-c[2*r+1:,:-2*r-1]+c[:-2*r-1,:-2*r-1])/((2*r+1)**2)
std=np.sqrt(np.maximum(box(L*L,1)-box(L,1)**2,0))
smooth=np.clip((34-std)/12,0,1)
core=near<-3
base_a=cover*notdark
# thin bright highlights on the paint read as "white" — close those gaps, but never the big white areas between tubes
solid=Image.fromarray(((base_a>0.5)*255).astype(np.uint8))
closed=np.asarray(solid.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.MinFilter(9))).astype(np.float32)/255
alpha=np.maximum(base_a,closed*(L>150)*(L<252))       # pure white (255) is always background
# rim light along the outline: light (but not pure white) pixels right next to the paint are paint too
rim=np.asarray(solid.filter(ImageFilter.MaxFilter(7))).astype(np.float32)/255
alpha=np.maximum(alpha,rim*(L>150)*np.clip((253-L)/3,0,1))
alpha=alpha*np.where(L<200,smooth,1)                      # busy mid-grey (chain, caliper) is not paint
cockpit=(xx>780)&(yy<340)                                  # stem and bar tape cross the head tube here
alpha=np.where(cockpit,alpha*np.clip((L-110)/45,0,1),alpha)
alpha=np.where(core|~cockpit,alpha,alpha*np.clip((L-170)/20,0,1))  # at that outline only light pixels count
# a 3×3 median clears isolated specks inside the paint (pearl texture, JPEG noise)
alpha=np.where(core,np.asarray(Image.fromarray((np.clip(alpha,0,1)*255).astype(np.uint8)).filter(ImageFilter.MedianFilter(3))).astype(np.float32)/255,alpha)
frame=inside*alpha
# components in front of the frame
cr=np.hypot(xx-540,yy-627)<66                     # chainring: nothing behind it counts
frame=np.where(cr,0,frame)
for cx,cy,r in [(902,552,48),(311,543,14)]:         # front rotor, rear dropout / caliper: only bright pearl counts
  ring=np.hypot(xx-cx,yy-cy)<r
  keep=(near<-4)&(idx==len(T)-1)   # the fork blade's own core stays frame even over the rotor
  frame=np.where(ring&~keep,frame*np.clip((L-195)/12,0,1),frame)
logo_area=(idx==5)&(near<-1)&(xx>590)&(xx<800)&(yy>310)&(yy<545)
logo=logo_area&(sat>0.13)&(cover>0.3)
logo=np.asarray(Image.fromarray((logo*255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(0.7))).astype(np.float32)/255
zones={}
for z in ['upper','lower','fork']:
  zi=[i for i,t in enumerate(T) if t[0]==z]
  m=np.isin(idx,zi)*frame*(1-logo)
  zones[z]=m
zones['logo']=logo*(inside*cover).clip(0,1)
# shading: frame brightness with the logo filled in from its surroundings
Lf=L.copy();fm=(frame>0.6)&(logo<0.1)
blur=gblur(np.where(fm,L,0).astype(np.float32),6)
wgt=gblur(fm.astype(np.float32),6)
fill=blur/np.maximum(wgt,1e-3)
Lf=np.where(logo>0.1,fill,Lf)
REF=228.0
shade=np.clip(Lf/REF,0,1)
hi=np.clip((Lf-REF)/(255-REF),0,1)*(frame>0.3)*(L<253)   # clipped white carries no highlight detail
np.savez('maps.npz',**zones,shade=shade,hi=hi)
for k,v in zones.items(): Image.fromarray((np.clip(v,0,1)*255).astype(np.uint8)).save(f'mask-{k}.png')
Image.fromarray((shade*255).astype(np.uint8)).save('shade.png');Image.fromarray((hi*255).astype(np.uint8)).save('hi.png')
# test composite
col={'upper':(200,40,40),'lower':(40,80,200),'fork':(40,160,80),'logo':(240,200,40)}
out=im.copy()
for k,c in col.items():
  a=np.clip(zones[k],0,1)[...,None]
  tint=np.array(c,np.float32)*shade[...,None]
  out=out*(1-a)+tint*a
out=np.clip(out+255*hi[...,None]*0.6,0,255)
Image.fromarray(out.astype(np.uint8)).save('test.png')
Image.fromarray(out.astype(np.uint8)).crop((200,50,1000,650)).save('test-crop.png')
