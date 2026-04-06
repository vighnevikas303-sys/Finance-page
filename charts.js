const Charts = (() => {
  function drawBarChart(canvasId, data) {
    const canvas=document.getElementById(canvasId);
    if (!canvas) return;
    const ctx=canvas.getContext("2d");
    const dpr=window.devicePixelRatio || 1;
    const rect=canvas.getBoundingClientRect();
    canvas.width=rect.width*dpr;
    canvas.height=rect.height*dpr;
    ctx.scale(dpr,dpr);
    const W=rect.width;
    const H=rect.height;
    ctx.clearRect(0,0,W,H);

    const padL=44,padR=16,padT=16,padB=36;
    const chartW=W-padL-padR;
    const chartH=H-padT-padB;

    const maxVal=Math.max(...data.map(d => Math.max(d.income,d.expenses)))*1.15;
    const steps=4;

    ctx.strokeStyle="rgba(120,120,120,0.12)";
    ctx.lineWidth=1;
    ctx.font="10px 'DM Sans', sans-serif";
    ctx.fillStyle="rgba(120,120,120,0.6)";
    ctx.textAlign="right";

    for (let i=0;i<=steps;i++) {
      const y=padT+chartH-(i/steps)*chartH;
      const val=Math.round((i/steps)*maxVal);
      ctx.beginPath();
      ctx.moveTo(padL,y);
      ctx.lineTo(padL+chartW,y);
      ctx.stroke();
      ctx.fillText("RS ."+(val>=1000?(val/1000).toFixed(1)+"k":val),padL-4,y+3);
    }

    const groupW=chartW/data.length;
    const barW=Math.min(groupW*0.28,24);
    const gap=4;

    data.forEach((d,i)=> {
      const cx=padL+i*groupW+groupW/2;
      const incH=(d.income/maxVal)*chartH;
      const expH=(d.expenses/maxVal)*chartH;

      const incX=cx-barW-gap/2;
      const expX=cx+gap/2;

      const grad1 = ctx.createLinearGradient(0, padT + chartH - incH, 0, padT + chartH);
      grad1.addColorStop(0, "#3B82F6");
      grad1.addColorStop(1, "#60A5FA");
      ctx.fillStyle = grad1;
      ctx.beginPath();
      ctx.roundRect(incX, padT + chartH - incH, barW, incH, [4, 4, 0, 0]);
      ctx.fill();

      const grad2 = ctx.createLinearGradient(0, padT + chartH - expH, 0, padT + chartH);
      grad2.addColorStop(0, "#EF4444");
      grad2.addColorStop(1, "#F87171");
      ctx.fillStyle = grad2;
      ctx.beginPath();
      ctx.roundRect(expX, padT + chartH - expH, barW, expH, [4, 4, 0, 0]);
      ctx.fill();

      ctx.fillStyle = "rgba(120,120,120,0.7)";
      ctx.textAlign = "center";
      ctx.font = "10px 'DM Sans', sans-serif";
      ctx.fillText(d.month, cx, padT + chartH + 16);
    });
  }

  function drawDonutChart(canvasId, segments) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const W = rect.width;
    const H = rect.height;
    ctx.clearRect(0, 0, W, H);

    const cx = W / 2, cy = H / 2;
    const outerR = Math.min(W, H) / 2 - 8;
    const innerR = outerR * 0.62;
    let startAngle = -Math.PI / 2;

    segments.forEach(seg => {
      const slice = (seg.pct / 100) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, outerR, startAngle, startAngle + slice);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();
      startAngle += slice;
    });

    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, 2 * Math.PI);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--surface") || "#fff";
    ctx.fill();

    ctx.textAlign="center";
    ctx.fillStyle="rgba(30,30,30,0.5)";
    ctx.font="10px 'DM Sans', sans-serif";
    ctx.fillText("TOTAL",cx,cy-7);
    ctx.fillStyle="#111";
    ctx.font="bold 14px 'DM Sans', sans-serif";
    const total=segments.reduce((sum, s)=>sum+s.amount,0);
    ctx.fillText(fmt(total),cx,cy+9);
  }

  function drawMiniLine(canvasId, data, color) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const W = rect.width, H = rect.height;
    ctx.clearRect(0, 0, W, H);
    const minV = Math.min(...data);
    const maxV = Math.max(...data);
    const range = maxV - minV || 1;
    const points = data.map((v, i) => ({
      x: (i / (data.length - 1)) * W,
      y: H - ((v - minV) / range) * (H * 0.75) - H * 0.1,
    }));
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, color + "44");
    grad.addColorStop(1, color + "00");
    ctx.beginPath();
    ctx.moveTo(points[0].x, H);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, H);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.stroke();
  }

  return {drawBarChart,drawDonutChart,drawMiniLine };
})();
