/* Small classroom scenes: Three.js owns the camera, meshes and occlusion tests;
   SVG keeps lines and mathematical labels sharp at every display scale. */
window.Space = (() => {
  const NS='http://www.w3.org/2000/svg',TAU=2*Math.PI;
  const make=(tag,attrs={})=>{const el=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,v);return el;};
  const cross=(a,b)=>a[0]*b[1]-a[1]*b[0];
  const lerp=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
  const boxOverlap=(a,b,pad=0)=>Math.max(0,Math.min(a.x+a.w+pad,b.x+b.w+pad)-Math.max(a.x-pad,b.x-pad))*Math.max(0,Math.min(a.y+a.h+pad,b.y+b.h+pad)-Math.max(a.y-pad,b.y-pad));
  function create(svg,options={}){
    const T=window.THREE;
    if(!T){svg.replaceChildren(make('text',{x:24,y:48,fill:'var(--plot-ink)'}));svg.firstChild.textContent='三维组件未载入，请重新打开完整课件文件。';return {setScene(){},render(){},setView(){},resetView(){},destroy(){},getState:()=>({available:false})};}
    const initial={yaw:options.view?.yaw??-.65,pitch:options.view?.pitch??.5,zoom:options.view?.zoom??1},view={...initial};
    const center=new T.Vector3(...(options.center||[0,0,0]));
    const camera=new T.OrthographicCamera(-4,4,4,-4,.01,100);
    camera.up.set(0,0,1);
    const raycaster=new T.Raycaster(),ndc=new T.Vector2(),scratch=new T.Vector3();
    const material=new T.MeshBasicMaterial({side:T.DoubleSide});
    const faceNodes=new Map(),edgeNodes=new Map(),pointNodes=new Map(),labelNodes=new Map();
    const faceLayer=make('g',{'data-space-layer':'faces'}),hiddenLayer=make('g',{'data-space-layer':'hidden'}),lineLayer=make('g',{'data-space-layer':'visible'}),pointLayer=make('g',{'data-space-layer':'points'}),labelLayer=make('g',{'data-space-layer':'labels'});
    svg.replaceChildren(faceLayer,hiddenLayer,lineLayer,pointLayer,labelLayer);
    svg.dataset.renderer='three-svg-depth';svg.style.touchAction='none';svg.style.cursor='grab';
    let scene={points:[],edges:[],faces:[],annotations:[]},activeFaces=[],w=1,h=1,frame=0,destroyed=false,revision=0;
    const pointers=new Map();let gesture=null;
    let stats={frames:0,lastFrameMs:0,maxFrameMs:0,visibleSegments:0,hiddenSegments:0,labelOverlaps:0,rayTests:0};
    const schedule=()=>{if(!frame&&!destroyed)frame=requestAnimationFrame(draw);};
    function setScene(next){
      scene={points:[],edges:[],faces:[],annotations:[],...next};revision++;
      const ids=new Set();
      for(const face of scene.faces){
        ids.add(face.id);let entry=faceNodes.get(face.id);
        if(!entry){const geometry=new T.BufferGeometry();entry={node:make('polygon'),mesh:new T.Mesh(geometry,material)};faceNodes.set(face.id,entry);faceLayer.append(entry.node);}
        const vertices=face.vertices.flat(),geometry=entry.mesh.geometry;
        let position=geometry.getAttribute('position');
        if(!position||position.count!==face.vertices.length)geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));else{position.array.set(vertices);position.needsUpdate=true;}
        const indices=[];for(let i=1;i<face.vertices.length-1;i++)indices.push(0,i,i+1);geometry.setIndex(indices);geometry.computeBoundingSphere();entry.mesh.updateMatrixWorld(true);entry.spec=face;
      }
      for(const [id,entry] of faceNodes)if(!ids.has(id)){entry.mesh.geometry.dispose();entry.node.remove();faceNodes.delete(id);}
      for(const [map,list] of [[edgeNodes,scene.edges],[pointNodes,scene.points],[labelNodes,[...scene.points.filter(p=>p.label),...scene.annotations]]]){
        const keep=new Set(list.map(item=>item.id));for(const [id,entry] of map)if(!keep.has(id)){if(entry.node)entry.node.remove();if(entry.front)entry.front.remove();if(entry.back)entry.back.remove();map.delete(id);}
      }
      schedule();
    }
    function setView(next){Object.assign(view,next);view.pitch=Math.max(-1.43,Math.min(1.43,view.pitch));view.zoom=Math.max(.7,Math.min(2.2,view.zoom));if(Math.abs(view.yaw)>Math.PI)view.yaw=((view.yaw+Math.PI)%TAU+TAU)%TAU-Math.PI;options.onViewChange?.({...view});schedule();}
    function cameraUpdate(){
      w=Math.max(svg.clientWidth,100);h=Math.max(svg.clientHeight,100);svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
      const span=(options.span||4)/view.zoom,aspect=w/h;
      camera.left=-span*aspect/2;camera.right=span*aspect/2;camera.top=span/2;camera.bottom=-span/2;
      const cp=Math.cos(view.pitch),sp=Math.sin(view.pitch),sy=Math.sin(view.yaw),cy=Math.cos(view.yaw);
      camera.position.set(center.x+12*sy*cp,center.y-12*cy*cp,center.z+12*sp);camera.lookAt(center);camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
    }
    function project(at){scratch.set(...at).project(camera);return [(scratch.x+1)*w/2,(1-scratch.y)*h/2,scratch.z];}
    function occluded(at,screen){
      if(!activeFaces.length)return false;
      ndc.set(screen[0]/w*2-1,1-screen[1]/h*2);raycaster.setFromCamera(ndc,camera);stats.rayTests++;
      const pointDistance=scratch.set(...at).sub(raycaster.ray.origin).dot(raycaster.ray.direction);
      const hit=raycaster.intersectObjects(activeFaces,false)[0];
      return !!hit&&hit.distance<pointDistance-2e-5;
    }
    function splitEdge(edge,pa,pb,projectedFaces){
      if(edge.occlude===false||!activeFaces.length)return [{a:pa,b:pb,hidden:false}];
      const d=[pb[0]-pa[0],pb[1]-pa[1]],cuts=[0,1];
      for(const face of projectedFaces){
        if(face.spec.occluder===false)continue;
        const polygon=face.projected;
        for(let i=0;i<polygon.length;i++){
          const c=polygon[i],e=polygon[(i+1)%polygon.length],side=[e[0]-c[0],e[1]-c[1]],den=cross(d,side);
          if(Math.abs(den)<1e-8)continue;
          const q=[c[0]-pa[0],c[1]-pa[1]],t=cross(q,side)/den,u=cross(q,d)/den;
          if(t>1e-7&&t<1-1e-7&&u>=-1e-7&&u<=1+1e-7)cuts.push(t);
        }
        // A segment may enter a face without crossing its projected outline.
        const [a,b,c]=face.spec.vertices,normal=new T.Vector3().subVectors(new T.Vector3(...b),new T.Vector3(...a)).cross(new T.Vector3().subVectors(new T.Vector3(...c),new T.Vector3(...a)));
        const da=normal.dot(new T.Vector3().subVectors(new T.Vector3(...edge.a),new T.Vector3(...a))),db=normal.dot(new T.Vector3().subVectors(new T.Vector3(...edge.b),new T.Vector3(...a)));
        if(Math.abs(da-db)>1e-10){const t=da/(da-db);if(t>1e-7&&t<1-1e-7)cuts.push(t);}
      }
      cuts.sort((a,b)=>a-b);const unique=cuts.filter((t,i)=>!i||t-cuts[i-1]>1e-6),pieces=[];
      for(let i=1;i<unique.length;i++){
        const lo=unique[i-1],hi=unique[i],mid=(lo+hi)/2,world=lerp(edge.a,edge.b,mid),hidden=occluded(world,lerp(pa,pb,mid));
        if(pieces.length&&pieces.at(-1).hidden===hidden)pieces.at(-1).b=lerp(pa,pb,hi);else pieces.push({a:lerp(pa,pb,lo),b:lerp(pa,pb,hi),hidden});
      }
      return pieces;
    }
    function labelEntry(spec){
      const signature=[spec.tex,spec.text||spec.label,spec.size||18,spec.color,spec.priority].join('|');let item=labelNodes.get(spec.id);
      if(item?.signature===signature)return item;
      if(item)item.node.remove();const node=make('g',{'data-space-label':spec.id,'pointer-events':'none'}),size=Lab.labelSize(spec.size||18);
      let width,height;
      if(spec.tex){
        const markup=M.svg(0,0,spec.tex,{size,color:spec.color||Lab.C.ink});node.innerHTML=markup;const content=node.firstElementChild;
        width=+content.getAttribute('width');height=+content.getAttribute('height');content.setAttribute('x','0');content.setAttribute('y','0');
      }else{
        const text=spec.text||spec.label||'';width=Math.max(size*.6,text.length*size*.61)+8;height=size*1.38;
        const content=make('text',{x:4,y:size,fill:spec.color||Lab.C.ink,'font-size':size,'font-weight':700,'paint-order':'stroke',stroke:'var(--canvas)','stroke-width':4,'stroke-linejoin':'round'});content.textContent=text;node.append(content);
      }
      const leader=make('line',{stroke:spec.color||Lab.C.gray,'stroke-width':Lab.lineWidth(1),opacity:.5});node.prepend(leader);labelLayer.append(node);
      if(!spec.tex){const content=node.querySelector('text');width=Math.ceil(content.getComputedTextLength())+8;height=Math.max(height,Math.ceil(content.getBBox().height)+8);}
      item={node,leader,width,height,signature,slot:-1};labelNodes.set(spec.id,item);return item;
    }
    function lineInBox(a,b,box){
      let lo=0,hi=1;const d=[b[0]-a[0],b[1]-a[1]];
      for(let i=0;i<2;i++){const min=i?box.y:box.x,max=min+(i?box.h:box.w);if(Math.abs(d[i])<1e-8){if(a[i]<min||a[i]>max)return 0;}else{let t0=(min-a[i])/d[i],t1=(max-a[i])/d[i];if(t0>t1)[t0,t1]=[t1,t0];lo=Math.max(lo,t0);hi=Math.min(hi,t1);if(lo>=hi)return 0;}}
      return (hi-lo)*Math.hypot(...d);
    }
    function placeLabels(specs,occupied,barriers){
      const placed=[],labels=specs.map(spec=>({spec,entry:labelEntry(spec),p:project(spec.at)})).sort((a,b)=>(b.spec.priority||40)-(a.spec.priority||40));
      for(const {spec,entry,p} of labels){
        entry.node.style.display='';
        const bw=entry.width,bh=entry.height,gap=11;
        const offsets=[[gap,-bh-gap/2],[-bw-gap,-bh-gap/2],[gap,gap/2],[-bw-gap,gap/2],[-bw/2,-bh-gap],[-bw/2,gap],[gap,-bh/2],[-bw-gap,-bh/2]];
        for(const ring of [25,42])offsets.push([ring,-bh-ring/2],[-bw-ring,-bh-ring/2],[ring,ring/2],[-bw-ring,ring/2],[-bw/2,-bh-ring],[-bw/2,ring]);
        if(spec.dx!=null||spec.dy!=null)offsets.unshift([spec.dx??gap,(spec.dy??0)-bh*.72]);
        let best=null;
        offsets.forEach(([dx,dy],slot)=>{
          const box={x:p[0]+dx,y:p[1]+dy,w:bw,h:bh};
          const outside=Math.max(0,8-box.x)+Math.max(0,box.x+bw-w+8)+Math.max(0,8-box.y)+Math.max(0,box.y+bh-h+8);
          let score=outside*1000+slot*1.8+(entry.slot>=0&&entry.slot!==slot?14:0);
          for(const other of placed)score+=boxOverlap(box,other,3)*80;
          for(const point of occupied)if(point.id!==spec.id)score+=boxOverlap(box,{x:point.p[0]-7,y:point.p[1]-7,w:14,h:14},2)*8;
          for(const edge of barriers)score+=lineInBox(edge.pa,edge.pb,box)*12;
          if(!best||score<best.score)best={...box,slot,score};
        });
        if(placed.some(other=>boxOverlap(best,other,1)>1))stats.labelOverlaps++;
        best.x=Math.max(6,Math.min(w-bw-6,best.x));best.y=Math.max(6,Math.min(h-bh-6,best.y));entry.slot=best.slot;
        entry.node.setAttribute('transform',`translate(${best.x.toFixed(2)} ${best.y.toFixed(2)})`);
        const lx=p[0]-best.x,ly=p[1]-best.y,cx=Math.max(0,Math.min(bw,lx)),cy=Math.max(0,Math.min(bh,ly));
        entry.leader.setAttribute('x1',lx);entry.leader.setAttribute('y1',ly);entry.leader.setAttribute('x2',cx);entry.leader.setAttribute('y2',cy);entry.leader.style.display=Math.hypot(lx-cx,ly-cy)>19?'':'none';
        placed.push(best);
      }
    }
    function draw(){
      frame=0;if(destroyed)return;const started=performance.now();cameraUpdate();
      stats.rayTests=0;stats.hiddenSegments=0;stats.visibleSegments=0;stats.labelOverlaps=0;
      const faces=[...faceNodes.values()].map(entry=>{entry.projected=entry.spec.vertices.map(project);entry.depth=entry.projected.reduce((a,p)=>a+p[2],0)/entry.projected.length;return entry;}).sort((a,b)=>b.depth-a.depth);
      activeFaces=faces.filter(f=>f.spec.occluder!==false).map(f=>f.mesh);
      for(const face of faces){face.node.setAttribute('points',face.projected.map(p=>p.slice(0,2).join(',')).join(' '));face.node.setAttribute('fill',face.spec.color||Lab.C.ink);face.node.setAttribute('opacity',face.spec.opacity??.08);face.node.setAttribute('stroke','none');face.node.style.display=face.spec.visible===false?'none':'';faceLayer.append(face.node);}
      const edges=scene.edges.map(edge=>({edge,pa:project(edge.a),pb:project(edge.b)})).sort((a,b)=>(b.pa[2]+b.pb[2])-(a.pa[2]+a.pb[2]));
      for(const {edge,pa,pb} of edges){
        let entry=edgeNodes.get(edge.id);if(!entry){entry={front:make('path'),back:make('path')};edgeNodes.set(edge.id,entry);}
        let front='',back='';for(const piece of splitEdge(edge,pa,pb,faces)){const d=`M${piece.a[0].toFixed(2)},${piece.a[1].toFixed(2)}L${piece.b[0].toFixed(2)},${piece.b[1].toFixed(2)}`;if(piece.hidden){back+=d;stats.hiddenSegments++;}else{front+=d;stats.visibleSegments++;}}
        for(const [node,d,hidden] of [[entry.front,front,false],[entry.back,back,true]]){
          node.setAttribute('d',d);node.setAttribute('fill','none');node.setAttribute('stroke',edge.color||Lab.C.ink);node.setAttribute('stroke-width',Lab.lineWidth(hidden?Math.max(1,(edge.width||2)*.7):edge.width||2));node.setAttribute('stroke-linecap','round');node.setAttribute('stroke-linejoin','round');node.setAttribute('stroke-dasharray',Lab.dashPattern(hidden?'5 5':edge.dash||'none'));node.setAttribute('opacity',hidden?(edge.hiddenOpacity??.38):(edge.opacity??1));node.dataset.spaceEdge=edge.id;
        }
        hiddenLayer.append(entry.back);lineLayer.append(entry.front);
      }
      const occupied=[];
      for(const {point,p} of scene.points.map(point=>({point,p:project(point.at)})).sort((a,b)=>b.p[2]-a.p[2])){
        const hidden=point.occlude!==false&&occluded(point.at,p);let entry=pointNodes.get(point.id);
        if(!entry){entry={node:make('circle')};pointNodes.set(point.id,entry);pointLayer.append(entry.node);}
        const color=point.color||Lab.C.ink;entry.node.setAttribute('cx',p[0]);entry.node.setAttribute('cy',p[1]);entry.node.setAttribute('r',point.radius||4.3);entry.node.setAttribute('fill',hidden?'var(--canvas)':color);entry.node.setAttribute('stroke',hidden?color:'var(--canvas)');entry.node.setAttribute('stroke-width',hidden?1.6:1.8);entry.node.setAttribute('opacity',hidden?.65:1);entry.node.dataset.spacePoint=point.id;pointLayer.append(entry.node);occupied.push({id:point.id,p});
      }
      for(const entry of labelNodes.values())entry.node.style.display='none';
      const annotations=scene.annotations.filter(item=>{if(!item.hideWhenEdgeOn)return true;const face=faceNodes.get(item.hideWhenEdgeOn);if(!face)return true;const polygon=face.projected;let twiceArea=0;for(let i=0;i<polygon.length;i++)twiceArea+=cross(polygon[i],polygon[(i+1)%polygon.length]);return Math.abs(twiceArea)>160;});
      placeLabels([...scene.points.filter(point=>point.label),...annotations],occupied,edges.filter(({edge})=>(edge.width||2)>=1.8));
      stats.frames++;stats.lastFrameMs=performance.now()-started;stats.maxFrameMs=Math.max(stats.maxFrameMs,stats.lastFrameMs);svg.dataset.hiddenSegments=stats.hiddenSegments;svg.dataset.spaceFrameMs=stats.lastFrameMs.toFixed(2);svg.dataset.spaceLabelOverlaps=stats.labelOverlaps;
    }
    function startGesture(){const p=[...pointers.values()];gesture=p.length>1?{distance:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y),zoom:view.zoom}:{x:p[0]?.x,y:p[0]?.y,yaw:view.yaw,pitch:view.pitch};}
    function down(e){if(e.button!=null&&e.button!==0)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});svg.setPointerCapture(e.pointerId);svg.style.cursor='grabbing';startGesture();}
    function move(e){if(!pointers.has(e.pointerId)||!gesture)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});const p=[...pointers.values()];if(p.length>1){const distance=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);if(gesture.distance>1)setView({zoom:gesture.zoom*distance/gesture.distance});}else setView({yaw:gesture.yaw+(e.clientX-gesture.x)*.007,pitch:gesture.pitch+(e.clientY-gesture.y)*.007});}
    function up(e){pointers.delete(e.pointerId);if(pointers.size)startGesture();else{gesture=null;svg.style.cursor='grab';}}
    function wheel(e){if(e.ctrlKey||e.metaKey)return;e.preventDefault();setView({zoom:view.zoom*Math.exp(-e.deltaY*.001)});}
    svg.addEventListener('pointerdown',down);svg.addEventListener('pointermove',move);svg.addEventListener('pointerup',up);svg.addEventListener('pointercancel',up);svg.addEventListener('wheel',wheel,{passive:false});
    const observer=new ResizeObserver(schedule);observer.observe(svg);schedule();
    return {setScene,render:schedule,setView,resetView:()=>setView(initial),getState:()=>({...view,renderer:'three-svg-depth'}),getDiagnostics:()=>({...stats,revision}),
      destroy(){destroyed=true;cancelAnimationFrame(frame);observer.disconnect();svg.removeEventListener('pointerdown',down);svg.removeEventListener('pointermove',move);svg.removeEventListener('pointerup',up);svg.removeEventListener('pointercancel',up);svg.removeEventListener('wheel',wheel);for(const entry of faceNodes.values())entry.mesh.geometry.dispose();material.dispose();pointers.clear();}
    };
  }
  return {create};
})();
