# Hero loop for custom-studio: cuts studio close-ups from three GIANT videos (video/source), avoiding anything that reads
# as a mountain bike, grades them to one dark look and exports desktop 16:9 + mobile 9:16 without audio.
import subprocess, sys, os, imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()
HERE = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.join(HERE, '..', 'source'); OUT = os.path.join(HERE, '..')
A = os.path.join(SRC, [f for f in os.listdir(SRC) if f.startswith('Bike Build')][0])     # Anthem build (workshop, bright)
B = os.path.join(SRC, [f for f in os.listdir(SRC) if f.startswith('Get To Know')][0])    # Trance E+ (studio, dark)
C = os.path.join(SRC, [f for f in os.listdir(SRC) if 'Toxic Pulse' in f][0])             # TCR Toxic Pulse (road, studio)
# (source, start s, duration s, mobile crop centre x, desktop crop box x,y,w,h as fractions of the 4K frame)
SHOTS = [
  (C,   0.3, 2.1, .50, (0, 0, 1, 1)),      # glowing tube of paint particles
  (C,   2.5, 0.9, .50, (0, 0, 1, 1)),      # particle burst
  (A,   9.3, 1.6, .70, (0, 0, 1, 1)),      # custom paint, head tube
  (A,  14.8, 1.1, .60, (0, 0, 1, 1)),      # pressing on the rider's name decal
  (C,   4.4, 1.0, .60, (0, 0, 1, 1)),      # painted down tube
  (C,   5.6, 1.6, .65, (0, 0, 1, 1)),      # head tube and top tube
  (B, 122.0, 2.0, .50, (0, 0, 1, 1)),      # light sweeping over machined metal
  (C,  10.5, 0.9, .55, (0, 0, 1, 1)),      # fork
  (C,  11.6, 2.4, .46, (0, 0, 1, 1)),      # frame reveal on the stage, fades out
]
GRADE = {A: "curves=all='0/0 0.5/0.36 1/0.9',eq=contrast=1.1:saturation=0.88", B: "eq=contrast=1.05:saturation=0.9", C: "eq=contrast=1.05:saturation=0.95"}
def run(args): subprocess.run([FF, '-hide_banner', '-loglevel', 'error', '-y', *args], check=True)
def seg(i, s, kind):
  src, t, d, cx, (x, y, w, h) = s
  if kind == 'desk': crop = f"crop=iw*{w}:ih*{h}:iw*{x}:ih*{y},scale=1600:900"
  else: crop = f"crop=ih*9/16:ih:min(max(iw*{cx}-ih*9/32\\,0)\\,iw-ih*9/16):0,scale=720:1280"
  out = os.path.join(HERE, f'_{kind}{i}.mp4')
  run(['-c:v', 'libaom-av1', '-ss', str(t), '-t', str(d), '-i', src, '-an', '-vf', f"{crop},fps=25,{GRADE[src]},format=yuv420p",
       '-c:v', 'libx264', '-crf', '12', '-preset', 'fast', out])
  return out
for kind, size in (('desk', '1600x900'), ('mob', '720x1280')):
  parts = [seg(i, s, kind) for i, s in enumerate(SHOTS)]
  lst = os.path.join(HERE, f'_{kind}.txt'); open(lst, 'w').write(''.join(f"file '{p}'\n" for p in parts))
  total = sum(s[2] for s in SHOTS)
  name = 'custom-hero' if kind == 'desk' else 'custom-hero-mobile'
  vf = f"vignette=PI/5,fade=t=in:st=0:d=0.4,fade=t=out:st={total-0.6:.2f}:d=0.6"
  run(['-f', 'concat', '-safe', '0', '-i', lst, '-vf', vf, '-c:v', 'libx264', '-crf', '31', '-preset', 'veryslow', '-tune', 'film',
       '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', os.path.join(OUT, name + '.mp4')])
  run(['-ss', '0.9', '-i', os.path.join(OUT, name + '.mp4'), '-frames:v', '1', '-q:v', '3', os.path.join(OUT, name + '-poster.jpg')])
  for p in parts + [lst]: os.remove(p)
print('done')
