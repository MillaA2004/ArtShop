let slideIndex = 1;
showSlides(slideIndex);

function plusSlides(n) {
  showSlides(slideIndex += n);
}

function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  let slides = document.querySelectorAll(".mySlides");
  let dots = document.querySelectorAll(".dot");
  
  if (slides.length === 0) return;
  
  if (n > slides.length) { slideIndex = 1 }
  if (n < 1) { slideIndex = slides.length }
  
  slides.forEach(slide => slide.style.display = "none");
  dots.forEach(dot => dot.classList.remove("active"));
  
  slides[slideIndex - 1].style.display = "block";
  if (dots.length >= slideIndex) {
    dots[slideIndex - 1].classList.add("active");
  }
}
