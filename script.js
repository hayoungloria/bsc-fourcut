
const FRAME_W = 336;
const FRAME_H = 235;
const FRAME_ASPECT = FRAME_W / FRAME_H;

const CAP_H = 720;
const CAP_W = Math.round(CAP_H * FRAME_ASPECT);

const startBtn = document.getElementById('start');
const shotBtn = document.getElementById('shot');
const cam = document.getElementById('cam');
const cap = document.getElementById('cap');
const preview = document.getElementById('preview');

let stream=null;

startBtn.onclick = async ()=>{
  stream = await navigator.mediaDevices.getUserMedia({video:true});
  cam.srcObject = stream;
  startBtn.style.display="none";
  shotBtn.style.display="inline-block";
};

shotBtn.onclick = ()=>{
  const vw = cam.videoWidth;
  const vh = cam.videoHeight;
  const vAspect = vw/vh;

  cap.width = CAP_W;
  cap.height = CAP_H;
  const ctx = cap.getContext('2d');

  ctx.save();
  ctx.scale(-1,1);
  ctx.translate(-CAP_W,0);

  if(vAspect > FRAME_ASPECT){
    const newW = vh * FRAME_ASPECT;
    const sx = (vw - newW)/2;
    ctx.drawImage(cam, sx,0,newW,vh, 0,0,CAP_W,CAP_H);
  }else{
    const newH = vw / FRAME_ASPECT;
    const sy = (vh - newH)/2;
    ctx.drawImage(cam, 0,sy,vw,newH, 0,0,CAP_W,CAP_H);
  }

  ctx.restore();

  preview.src = cap.toDataURL("image/jpeg",0.9);
  preview.style.display="block";
};
