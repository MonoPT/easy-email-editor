window.addEventListener("contextmenu", (e) => {
  let target = (e.target as HTMLElement);


  if (target.closest(".MenuItemTemplateSubfolder")) { //Is subfolder
    e.preventDefault();
    let subfolder = target.closest(".MenuItemTemplateSubfolder");



  } else if ((target.parentNode as HTMLElement).classList.contains("MenuItemTemplateFolder")) { //is Folder
    e.preventDefault();
    let folder = target.parentNode;

  }
});