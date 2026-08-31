(function(){
  "use strict";

  var doc=document;
  var body=doc.body;
  var reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root=body.getAttribute("data-root")||"";

  if("scrollRestoration" in history)history.scrollRestoration="manual";
  doc.documentElement.classList.add("js");

  function q(selector,scope){return(scope||doc).querySelector(selector)}
  function qa(selector,scope){return Array.prototype.slice.call((scope||doc).querySelectorAll(selector))}
  function imagePath(name){return root+"assets/img/gallery/"+name}
  function productPath(id){return root+"catalogue/produit.html?ref="+encodeURIComponent(id)}

  /* Opening screen */
  function initLoader(){
    var loader=q(".loader");
    if(!loader){body.classList.add("is-ready");return}
    if(reduced){loader.remove();body.classList.add("is-ready");return}
    var count=q("[data-loader-count]",loader);var value=0;
    var timer=setInterval(function(){
      value=Math.min(100,value+Math.max(1,Math.ceil((100-value)*.13)));
      if(count)count.textContent=String(value).padStart(2,"0");
      if(value>=100){clearInterval(timer);setTimeout(function(){loader.classList.add("is-done");body.classList.add("is-ready")},240)}
    },38);
  }

  /* Header, overlays and internal transitions */
  function initHeader(){
    var header=q(".site-head");if(!header)return;
    var nativeLight=header.classList.contains("is-light");
    function paint(){header.classList.toggle("is-solid",scrollY>innerHeight*.62);header.classList.toggle("is-light",nativeLight||scrollY>innerHeight*.62)}
    addEventListener("scroll",paint,{passive:true});paint();
  }

  function setOverlay(name,open){
    var panel=q('[data-overlay="'+name+'"]');if(!panel)return;
    if(open)qa(".overlay.is-open").forEach(function(other){other.classList.remove("is-open");other.setAttribute("aria-hidden","true")});
    panel.classList.toggle("is-open",open);panel.setAttribute("aria-hidden",String(!open));
    qa('[data-open="'+name+'"]').forEach(function(trigger){trigger.setAttribute("aria-expanded",String(open))});
    body.classList.toggle("is-locked",open);
    if(open){var first=q("button,a,input,textarea",panel);if(first)setTimeout(function(){first.focus()},80)}
  }

  function initOverlays(){
    qa("[data-open]").forEach(function(trigger){trigger.setAttribute("aria-haspopup","dialog");trigger.setAttribute("aria-expanded","false");trigger.addEventListener("click",function(){setOverlay(trigger.getAttribute("data-open"),true)})});
    qa("[data-close]").forEach(function(trigger){trigger.addEventListener("click",function(){setOverlay(trigger.getAttribute("data-close"),false)})});
    qa(".overlay").forEach(function(panel){panel.setAttribute("role","dialog");panel.setAttribute("aria-modal","true");panel.addEventListener("click",function(event){if(event.target===panel)setOverlay(panel.getAttribute("data-overlay"),false)})});
    qa(".overlay a").forEach(function(link){link.addEventListener("click",function(){var panel=link.closest(".overlay");if(panel)setOverlay(panel.getAttribute("data-overlay"),false)})});
    addEventListener("keydown",function(event){if(event.key==="Escape")qa(".overlay.is-open").forEach(function(panel){setOverlay(panel.getAttribute("data-overlay"),false)})});
  }

  function initTransitions(){
    if(reduced)return;
    qa('a[href]').forEach(function(link){link.addEventListener("click",function(event){
      var href=link.getAttribute("href");
      if(!href||href.charAt(0)==="#"||href.indexOf("mailto:")===0||href.indexOf("tel:")===0||link.target==="_blank"||event.metaKey||event.ctrlKey)return;
      var url=new URL(link.href,location.href);if(url.origin!==location.origin)return;
      event.preventDefault();body.classList.add("is-leaving");setTimeout(function(){location.href=url.href},620);
    })});
  }

  /* Word masks and viewport reveals */
  function splitWords(){
    qa("[data-split]").forEach(function(element){
      if(element.dataset.splitReady)return;element.dataset.splitReady="true";
      var nodes=Array.prototype.slice.call(element.childNodes);var index=0;
      nodes.forEach(function(node){
        if(node.nodeType!==3)return;
        var fragment=doc.createDocumentFragment();var words=node.textContent.split(/(\s+)/);
        words.forEach(function(word){
          if(/^\s+$/.test(word)){fragment.appendChild(doc.createTextNode(word));return}
          if(!word)return;
          var mask=doc.createElement("span");var inner=doc.createElement("span");mask.className="split-word";inner.style.setProperty("--i",index++);inner.textContent=word;mask.appendChild(inner);fragment.appendChild(mask);
        });node.replaceWith(fragment);
      });
    });
  }

  function initReveal(){
    splitWords();var items=qa("[data-reveal],[data-split]");
    if(reduced||!("IntersectionObserver" in window)){items.forEach(function(item){item.classList.add("is-visible")});return}
    var observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add("is-visible");observer.unobserve(entry.target)}})},{threshold:.12,rootMargin:"0px 0px -8%"});
    items.forEach(function(item){observer.observe(item)});
  }

  function initParallax(){
    if(reduced)return;var items=qa("[data-parallax]");if(!items.length)return;var ticking=false;
    function paint(){ticking=false;items.forEach(function(item){var box=item.getBoundingClientRect();if(box.bottom<0||box.top>innerHeight)return;var amount=parseFloat(item.getAttribute("data-parallax"))||18;var progress=(box.top+box.height/2-innerHeight/2)/innerHeight;item.style.transform="translateY("+(-progress*amount).toFixed(2)+"px)"})}
    addEventListener("scroll",function(){if(!ticking){ticking=true;requestAnimationFrame(paint)}},{passive:true});paint();
  }

  /* Home interactions */
  function initHeroTitle(){
    qa("[data-hero-title]").forEach(function(title){
      var index=0;
      function splitNode(node){
        var fragment=doc.createDocumentFragment();
        Array.from(node.textContent).forEach(function(character){var span=doc.createElement("span");span.className="hero-char";span.style.setProperty("--i",index++);span.textContent=character===" "?"\u00a0":character;fragment.appendChild(span)});
        node.replaceWith(fragment);
      }
      Array.prototype.slice.call(title.childNodes).forEach(function(node){if(node.nodeType===3)splitNode(node);else if(node.nodeType===1)Array.prototype.slice.call(node.childNodes).forEach(function(child){if(child.nodeType===3)splitNode(child)})});
    });
  }

  function initHero(){
    var hero=q(".era-hero");if(!hero)return;
    qa("[data-mode]",hero).forEach(function(button){button.addEventListener("click",function(){var mode=button.getAttribute("data-mode");qa("[data-hero-image]",hero).forEach(function(image){image.classList.toggle("is-active",image.getAttribute("data-hero-image")===mode)});qa("[data-mode]",hero).forEach(function(item){var active=item===button;item.classList.toggle("is-active",active);item.setAttribute("aria-pressed",String(active))})})});
  }

  function initBenefits(){
    var track=q(".benefits__track");if(!track)return;var slides=qa(".benefit",track);var index=0;var current=q("[data-benefit-current]");
    function go(next){index=(next+slides.length)%slides.length;track.style.transform="translateX("+(-index*100)+"%)";slides.forEach(function(slide,i){slide.classList.toggle("is-current",i===index)});if(current)current.textContent=String(index+1).padStart(2,"0")}
    var previous=q("[data-benefit-prev]"),next=q("[data-benefit-next]");if(previous)previous.addEventListener("click",function(){go(index-1)});if(next)next.addEventListener("click",function(){go(index+1)});go(0);
  }

  function initChapters(){
    var area=q(".chapters"),stage=q(".chapters__stage");if(!area||!stage||reduced||innerWidth<=900)return;var chapters=qa(".chapter",stage);var progressBar=q(".chapters__progress span",stage);var ticking=false;
    function paint(){ticking=false;var box=area.getBoundingClientRect();var total=area.offsetHeight-innerHeight;var progress=Math.max(0,Math.min(1,-box.top/total));var index=Math.min(chapters.length-1,Math.floor(progress*chapters.length));chapters.forEach(function(chapter,i){chapter.classList.toggle("is-active",i===index)});if(progressBar)progressBar.style.width=(progress*100)+"%"}
    addEventListener("scroll",function(){if(!ticking){ticking=true;requestAnimationFrame(paint)}},{passive:true});addEventListener("resize",paint);paint();
  }

  function initCraft(){
    var items=qa(".craft-item"),images=qa(".craft__media img");if(!items.length)return;
    function open(index){items.forEach(function(item,i){var active=i===index;item.classList.toggle("is-open",active);item.setAttribute("aria-expanded",String(active))});images.forEach(function(image,i){image.classList.toggle("is-active",i===index)})}
    items.forEach(function(item,index){item.setAttribute("role","button");item.setAttribute("tabindex","0");item.setAttribute("aria-expanded","false");item.addEventListener("click",function(){open(index)});item.addEventListener("keydown",function(event){if(event.key==="Enter"||event.key===" "){event.preventDefault();open(index)}})});open(0);
  }

  /* Catalogue */
  function shortSpecs(product){return product.specs.slice(0,2).map(function(spec){return'<span>'+spec[0]+'<b>'+spec[1]+'</b></span>'}).join("")}
  function initCatalogue(){
    var list=q("[data-product-list]");if(!list||!window.VERA_PRODUCTS)return;
    list.innerHTML=window.VERA_PRODUCTS.map(function(product,index){var alternate=window.VERA_PRODUCTS[(index+4)%window.VERA_PRODUCTS.length];return'<a class="product-row" data-family="'+product.family+'" href="'+productPath(product.id)+'" aria-label="Découvrir '+product.name+'"><div class="product-row__copy"><div class="product-row__top"><span class="product-row__number">'+product.number+'</span><span class="product-row__family">'+product.familyLabel+'</span></div><div><div class="product-row__category">'+product.category+'</div><h2 class="product-row__name">'+product.name+'</h2></div><div class="product-row__specs">'+shortSpecs(product)+'</div></div><div class="product-row__media"><img src="'+imagePath(product.image)+'" alt="'+product.imageAlt+'" loading="lazy"><img src="'+imagePath(alternate.image)+'" alt="" loading="lazy"><span class="product-row__arrow" aria-hidden="true">↗</span></div></a>'}).join("");
    var count=q("[data-product-count]");if(count)count.textContent=String(window.VERA_PRODUCTS.length).padStart(2,"0");
    var buttons=qa("[data-filter]"),empty=q(".empty");
    function applyFilter(value){var visible=0;buttons.forEach(function(button){button.classList.toggle("is-active",button.getAttribute("data-filter")===value)});qa(".product-row",list).forEach(function(row){var show=value==="all"||row.getAttribute("data-family")===value;row.hidden=!show;if(show)visible++});if(empty)empty.classList.toggle("is-visible",visible===0)}
    buttons.forEach(function(button){button.addEventListener("click",function(){var value=button.getAttribute("data-filter");applyFilter(value);history.replaceState(null,"",value==="all"?location.pathname:"#"+value)})});
    function hashFilter(){var value=location.hash.replace("#","")||"all";if(!q('[data-filter="'+value+'"]'))value="all";applyFilter(value)}
    addEventListener("hashchange",hashFilter);hashFilter();
  }

  /* Product detail */
  function specMarkup(list){return list.map(function(item){return'<div class="spec"><dt>'+item[0]+'</dt><dd>'+item[1]+'</dd></div>'}).join("")}
  function optionMarkup(list){return list.map(function(item,index){return'<article class="option"><span class="option__number">'+String(index+1).padStart(2,"0")+'</span><h3>'+item+'</h3><p>Configuration définie pendant l\'étude technique et détaillée dans le devis.</p></article>'}).join("")}
  function relatedMarkup(list){return list.map(function(item){return'<a class="related-card" href="'+productPath(item.id)+'"><div class="related-card__media"><img src="'+imagePath(item.image)+'" alt="'+item.imageAlt+'" loading="lazy"></div><div class="related-card__meta"><h3>'+item.name+'</h3><span>'+item.category+'</span></div></a>'}).join("")}
  function initDetail(){
    if(!body.hasAttribute("data-product-detail")||!window.VERA_PRODUCTS)return;
    var id=new URLSearchParams(location.search).get("ref")||"platin";var product=window.VERA_PRODUCTS.find(function(item){return item.id===id})||window.VERA_PRODUCTS[1];var next=window.VERA_PRODUCTS.find(function(item){return item.id===product.next})||window.VERA_PRODUCTS[0];
    doc.title=product.name+" | Vera Nova";qa("[data-product-name]").forEach(function(element){element.textContent=product.name});qa("[data-product-number]").forEach(function(element){element.textContent=product.number});qa("[data-product-category]").forEach(function(element){element.textContent=product.category});qa("[data-product-intro]").forEach(function(element){element.textContent=product.intro});
    var hero=q("[data-product-hero]");if(hero){hero.src=imagePath(product.image);hero.alt=product.imageAlt}
    [["[data-gallery-one]",product.altImage,"Vue complémentaire de "+product.name],["[data-gallery-two]",product.thirdImage,"Ambiance extérieure avec "+product.name],["[data-gallery-three]",product.image,product.imageAlt]].forEach(function(entry){var image=q(entry[0]);if(image){image.src=imagePath(entry[1]);image.alt=entry[2]}});
    var specs=q("[data-product-specs]"),features=q("[data-product-features]"),options=q("[data-product-options]");if(specs)specs.innerHTML=specMarkup(product.specs);if(features)features.innerHTML=optionMarkup(product.features);if(options)options.innerHTML=optionMarkup(product.options);
    var productIndex=window.VERA_PRODUCTS.indexOf(product);var related=q("[data-related-products]");if(related){var relatedItems=[1,2,3].map(function(offset){return window.VERA_PRODUCTS[(productIndex+offset)%window.VERA_PRODUCTS.length]});related.innerHTML=relatedMarkup(relatedItems)}
    qa("[data-next-name]").forEach(function(element){element.textContent=next.name});var nextLink=q("[data-next-link]");if(nextLink)nextLink.href=productPath(next.id);var nextImage=q("[data-next-image]");if(nextImage){nextImage.src=imagePath(next.image);nextImage.alt=next.imageAlt}
  }

  /* Mail application form, no third party collection */
  function initForms(){
    qa(".form").forEach(function(form){form.addEventListener("submit",function(event){
      event.preventDefault();var state=q(".form__state",form);var pot=q('[name="website"]',form);if(pot&&pot.value)return;
      var name=q('[name="nom"]',form),phone=q('[name="telephone"]',form),email=q('[name="email"]',form),message=q('[name="message"]',form);
      if(!name||!phone||!email||!name.value.trim()||!phone.value.trim()||!email.checkValidity()){if(state)state.textContent="Merci de compléter vos coordonnées.";return}
      var subject=encodeURIComponent("Demande de devis Vera Nova - "+name.value.trim());var content=encodeURIComponent("Nom : "+name.value+"\nTéléphone : "+phone.value+"\nE-mail : "+email.value+"\n\nProjet :\n"+(message?message.value:""));if(state)state.textContent="Votre messagerie va s'ouvrir pour finaliser la demande.";location.href="mailto:contact@veranova.fr?subject="+subject+"&body="+content;
    })});
  }

  function setYear(){qa("[data-year]").forEach(function(element){element.textContent=new Date().getFullYear()})}

  initHeroTitle();initLoader();initHeader();initOverlays();initHero();initBenefits();initChapters();initCraft();initCatalogue();initDetail();initReveal();initParallax();initForms();initTransitions();setYear();
})();
