(function(){
  "use strict";

  var doc=document;
  var body=doc.body;
  var reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root=body.getAttribute("data-root")||"";

  function q(selector,scope){return(scope||doc).querySelector(selector)}
  function qa(selector,scope){return Array.prototype.slice.call((scope||doc).querySelectorAll(selector))}

  function initPreloader(){
    var loader=q(".preloader");
    if(!loader)return;
    if(reduced){loader.remove();return}
    var count=q("[data-load-count]",loader);
    var value=0;
    loader.classList.add("is-loading");
    var timer=setInterval(function(){
      value=Math.min(100,value+Math.ceil((100-value)*.16));
      if(count)count.textContent=String(value).padStart(2,"0");
      if(value>=100){
        clearInterval(timer);
        setTimeout(function(){loader.classList.add("is-done")},260);
      }
    },42);
    addEventListener("load",function(){value=Math.max(value,88)},{once:true});
  }

  function initHeader(){
    var header=q(".header");
    if(!header)return;
    function paint(){header.classList.toggle("is-solid",scrollY>40||header.classList.contains("header--light"))}
    addEventListener("scroll",paint,{passive:true});paint();
  }

  function setOverlay(name,open){
    var panel=q('[data-overlay="'+name+'"]');
    if(!panel)return;
    if(open)qa(".overlay.is-open").forEach(function(item){item.classList.remove("is-open");item.setAttribute("aria-hidden","true")});
    panel.classList.toggle("is-open",open);
    panel.setAttribute("aria-hidden",String(!open));
    qa('[data-open="'+name+'"]').forEach(function(trigger){trigger.setAttribute("aria-expanded",String(open))});
    body.classList.toggle("is-locked",open);
    if(open){var focusable=q("button,a,input,select,textarea",panel);if(focusable)setTimeout(function(){focusable.focus()},80)}
  }

  function initOverlays(){
    qa("[data-open]").forEach(function(btn){btn.setAttribute("aria-haspopup","dialog");btn.setAttribute("aria-expanded","false");btn.addEventListener("click",function(){setOverlay(btn.getAttribute("data-open"),true)})});
    qa("[data-close]").forEach(function(btn){btn.addEventListener("click",function(){setOverlay(btn.getAttribute("data-close"),false)})});
    qa(".overlay").forEach(function(panel){panel.setAttribute("role","dialog");panel.setAttribute("aria-modal","true");panel.addEventListener("click",function(event){if(event.target===panel)setOverlay(panel.getAttribute("data-overlay"),false)})});
    qa(".overlay a").forEach(function(link){link.addEventListener("click",function(){setOverlay(link.closest(".overlay").getAttribute("data-overlay"),false)})});
    addEventListener("keydown",function(event){if(event.key==="Escape")qa(".overlay.is-open").forEach(function(panel){setOverlay(panel.getAttribute("data-overlay"),false)})});
  }

  function initPageTransitions(){
    if(reduced)return;
    qa('a[href]').forEach(function(link){
      link.addEventListener("click",function(event){
        var href=link.getAttribute("href");
        if(!href||href.charAt(0)==="#"||href.indexOf("mailto:")===0||href.indexOf("tel:")===0||link.target==="_blank"||event.metaKey||event.ctrlKey)return;
        var url=new URL(link.href,location.href);
        if(url.origin!==location.origin)return;
        event.preventDefault();body.classList.add("is-leaving");setTimeout(function(){location.href=url.href},520);
      });
    });
  }

  function initReveal(){
    var items=qa("[data-reveal],.mask");
    if(!items.length)return;
    if(reduced||!("IntersectionObserver"in window)){items.forEach(function(el){el.classList.add("is-visible")});return}
    var observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add("is-visible");observer.unobserve(entry.target)}})},{threshold:.12,rootMargin:"0px 0px -6%"});
    items.forEach(function(el){observer.observe(el)});
  }

  function initParallax(){
    if(reduced||!matchMedia("(pointer:fine)").matches)return;
    var items=qa("[data-parallax]");
    if(!items.length)return;
    var active=false;
    function paint(){
      active=false;
      items.forEach(function(el){var box=el.getBoundingClientRect();if(box.bottom<0||box.top>innerHeight)return;var amount=parseFloat(el.getAttribute("data-parallax"))||20;var progress=(box.top+box.height/2-innerHeight/2)/innerHeight;el.style.transform="translate3d(0,"+(-progress*amount).toFixed(2)+"px,0)"});
    }
    addEventListener("scroll",function(){if(!active){active=true;requestAnimationFrame(paint)}},{passive:true});paint();
  }

  function initMagnetic(){
    if(reduced||!matchMedia("(pointer:fine)").matches)return;
    qa("[data-magnetic]").forEach(function(el){
      el.addEventListener("pointermove",function(event){var box=el.getBoundingClientRect();var x=(event.clientX-box.left-box.width/2)*.16;var y=(event.clientY-box.top-box.height/2)*.16;el.style.transform="translate("+x+"px,"+y+"px)"});
      el.addEventListener("pointerleave",function(){el.style.transform=""});
    });
  }

  function initHero(){
    var hero=q(".hero");if(!hero)return;
    qa("[data-mode]",hero).forEach(function(btn){btn.addEventListener("click",function(){var night=btn.getAttribute("data-mode")==="night";hero.classList.toggle("is-night",night);qa("[data-mode]",hero).forEach(function(item){var on=item===btn;item.classList.toggle("is-active",on);item.setAttribute("aria-pressed",String(on))})})});
  }

  function initBenefits(){
    var track=q(".benefits__track");if(!track)return;
    var slides=qa(".benefit",track);var index=0;var counter=q("[data-slide-count]");
    function go(next){index=(next+slides.length)%slides.length;track.style.transform="translateX("+(-index*100)+"%)";if(counter)counter.textContent=String(index+1).padStart(2,"0")}
    var prev=q("[data-slide-prev]"),next=q("[data-slide-next]");if(prev)prev.addEventListener("click",function(){go(index-1)});if(next)next.addEventListener("click",function(){go(index+1)});go(0);
  }

  function initStory(){
    var area=q(".story-scroll"),track=q(".story__track");if(!area||!track||reduced||innerWidth<=900)return;
    var ticking=false;
    function paint(){ticking=false;var box=area.getBoundingClientRect();var total=area.offsetHeight-innerHeight;var progress=Math.max(0,Math.min(1,-box.top/total));track.style.transform="translate3d("+(-progress*200/3)+"%,0,0)"}
    addEventListener("scroll",function(){if(!ticking){ticking=true;requestAnimationFrame(paint)}},{passive:true});addEventListener("resize",paint);paint();
  }

  function initFeatures(){
    var features=qa(".feature"),images=qa(".features__media img");if(!features.length)return;
    function open(index){features.forEach(function(item,i){var on=i===index;item.classList.toggle("is-active",on);item.setAttribute("aria-expanded",String(on))});images.forEach(function(img,i){img.classList.toggle("is-active",i===index)})}
    features.forEach(function(item,index){item.addEventListener("click",function(){open(index)});item.addEventListener("keydown",function(event){if(event.key==="Enter"||event.key===" "){event.preventDefault();open(index)}})});open(0);
  }

  function productLink(id){return root+"catalogue/produit.html?ref="+encodeURIComponent(id)}
  function imagePath(name){return root+"assets/img/gallery/"+name}
  function specShort(product){return product.specs.slice(0,2).map(function(spec){return"<span>"+spec[0]+" <b>"+spec[1]+"</b></span>"}).join("")}

  function initCatalogue(){
    var grid=q("[data-product-grid]");if(!grid||!window.VERA_PRODUCTS)return;
    grid.innerHTML=window.VERA_PRODUCTS.map(function(product,index){var second=window.VERA_PRODUCTS[(index+3)%window.VERA_PRODUCTS.length].image;return '<a class="product-card" data-family="'+product.family+'" href="'+productLink(product.id)+'" aria-label="Voir '+product.name+'"><div class="product-card__media"><img src="'+imagePath(product.image)+'" alt="'+product.imageAlt+'" loading="lazy"><img src="'+imagePath(second)+'" alt="" loading="lazy"></div><div class="product-card__top"><span>'+product.number+'</span><span>'+product.familyLabel+'</span></div><div class="product-card__bottom"><p class="eyebrow">'+product.category+'</p><h2 class="product-card__name">'+product.name+'</h2><div class="product-card__data">'+specShort(product)+'<span class="product-card__arrow">↗</span></div></div></a>'}).join("");
    var total=q("[data-product-total]");if(total)total.textContent=String(window.VERA_PRODUCTS.length).padStart(2,"0");
    var buttons=qa("[data-filter]");var empty=q(".empty");
    function applyFilter(value){var visible=0;var active=q('[data-filter="'+value+'"]')||q('[data-filter="all"]');buttons.forEach(function(item){item.classList.toggle("is-active",item===active)});qa(".product-card",grid).forEach(function(card){var show=value==="all"||card.getAttribute("data-family")===value;card.hidden=!show;if(show)visible++});if(empty)empty.classList.toggle("is-visible",visible===0)}
    buttons.forEach(function(button){button.addEventListener("click",function(){var value=button.getAttribute("data-filter");applyFilter(value);if(value==="all")history.replaceState(null,"",location.pathname+location.search);else history.replaceState(null,"","#"+value)})});
    function applyHash(){applyFilter(location.hash.replace("#","")||"all")}
    addEventListener("hashchange",applyHash);applyHash();
  }

  function detailMarkup(list,tag){return list.map(function(item,index){return tag==="spec"?'<div class="spec"><dt>'+item[0]+'</dt><dd>'+item[1]+'</dd></div>':'<article class="option"><span class="option__number">'+String(index+1).padStart(2,"0")+'</span><h3>'+item+'</h3><p>Configuration définie lors de l\'étude technique et du devis.</p></article>'}).join("")}

  function initDetail(){
    var holder=q("[data-product-detail]");if(!holder||!window.VERA_PRODUCTS)return;
    var id=new URLSearchParams(location.search).get("ref")||"platin";
    var product=window.VERA_PRODUCTS.find(function(item){return item.id===id})||window.VERA_PRODUCTS[1];
    var next=window.VERA_PRODUCTS.find(function(item){return item.id===product.next})||window.VERA_PRODUCTS[0];
    doc.title=product.name+" | Vera Nova";
    qa("[data-product-name]").forEach(function(el){el.textContent=product.name});
    qa("[data-product-category]").forEach(function(el){el.textContent=product.category});
    qa("[data-product-number]").forEach(function(el){el.textContent=product.number});
    qa("[data-product-intro]").forEach(function(el){el.textContent=product.intro});
    var hero=q("[data-product-hero]");if(hero){hero.src=imagePath(product.image);hero.alt=product.imageAlt}
    var g1=q("[data-gallery-one]"),g2=q("[data-gallery-two]"),g3=q("[data-gallery-three]");
    if(g1){g1.src=imagePath(product.altImage);g1.alt="Vue complémentaire de "+product.name}if(g2){g2.src=imagePath(product.thirdImage);g2.alt="Ambiance extérieure avec "+product.name}if(g3){g3.src=imagePath(product.image);g3.alt=product.imageAlt}
    var specs=q("[data-product-specs]");if(specs)specs.innerHTML=detailMarkup(product.specs,"spec");
    var features=q("[data-product-features]");if(features)features.innerHTML=detailMarkup(product.features,"option");
    var options=q("[data-product-options]");if(options)options.innerHTML=detailMarkup(product.options,"option");
    qa("[data-next-name]").forEach(function(el){el.textContent=next.name});var nextLink=q("[data-next-link]");if(nextLink)nextLink.href=productLink(next.id);var nextImage=q("[data-next-image]");if(nextImage){nextImage.src=imagePath(next.image);nextImage.alt=next.imageAlt}
  }

  function initForms(){
    qa(".form").forEach(function(form){form.addEventListener("submit",function(event){event.preventDefault();var state=q(".form__state",form);var pot=q('[name="site"]',form);if(pot&&pot.value)return;var name=q('[name="nom"]',form),phone=q('[name="telephone"]',form),email=q('[name="email"]',form);if(!name.value.trim()||!phone.value.trim()||!email.value.trim()||!email.checkValidity()){if(state)state.textContent="Merci de compléter vos coordonnées.";return}var subject=encodeURIComponent("Demande de devis Vera Nova - "+name.value.trim());var message=q('[name="message"]',form);var bodyText=encodeURIComponent("Nom : "+name.value+"\nTéléphone : "+phone.value+"\nE-mail : "+email.value+"\n\nProjet :\n"+(message?message.value:""));if(state)state.textContent="Votre messagerie va s'ouvrir pour finaliser la demande.";location.href="mailto:contact@veranova.fr?subject="+subject+"&body="+bodyText})});
  }

  function setYear(){qa("[data-year]").forEach(function(el){el.textContent=new Date().getFullYear()})}

  doc.documentElement.classList.add("js");
  initPreloader();initHeader();initOverlays();initHero();initBenefits();initFeatures();initCatalogue();initDetail();initReveal();initParallax();initMagnetic();initStory();initForms();initPageTransitions();setYear();
})();
