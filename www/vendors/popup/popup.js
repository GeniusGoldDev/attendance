/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var overlayElement = null;
var modalWindowElement = null;

//show the modal overlay and popup window
function showPopUpMessage(msg) {
    overlayElement = document.createElement("div");
    overlayElement.className = 'modalOverlay';
    modalWindowElement = document.createElement("div");
    modalWindowElement.className = 'modalWindow';
    modalWindowElement.innerHTML = msg;
    //modalWindowElement.style.left = (window.innerWidth - modalWindowElement.innerWidth ) / 2 + "px";
    document.body.appendChild(overlayElement);
    document.body.appendChild(modalWindowElement);
    setTimeout(function() {
        modalWindowElement.style.opacity = 1;
        overlayElement.style.opacity = 0.4;
        overlayElement.addEventListener("click", hidePopUpMessage, false);
    }, 300);
}
//hide the modal overlay and popup window
function hidePopUpMessage() {
    modalWindowElement.style.opacity = 0;
    overlayElement.style.opacity = 0;
    overlayElement.removeEventListener("click", hidePopUpMessage, false);
    setTimeout(function() {
        document.body.removeChild(overlayElement);
        document.body.removeChild(modalWindowElement);
    }, 400);
}

