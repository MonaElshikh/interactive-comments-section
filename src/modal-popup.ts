class Modal {
  modal: any;
  modelContent: any;
  modelHeader: any;
  modelBody: any;
  btnYes: any;
  btnNo: any;
  btnClose: any;
  size = { sm: "50%", md: "75%", lg: "90%" };
  modalDesign = ` 
  <!-- Modal content -->
  <div class="modal-content">
  <div class="modal-header">
  <h4></h4>
  </div>
  <div class="modal-body">
      <p>
      </p>
  </div>
  <div class="actions-button">
      <button id="btnNo">No, Cancel</button>
      <button id="btnYes">Yes, Delete</button>
  </div>
 </div>`;
  constructor(modalId: string, closeBtn?: boolean) {
    this.modal = document.querySelector(`#${modalId}`);
    this.modal.innerHTML = this.modalDesign;
    this.modelContent = document.querySelector(".modal-content");
    this.modelHeader = document.querySelector(".modal-header>h4");
    this.modelBody = document.querySelector(`.modal-body>p`);
    this.btnYes = document.querySelector("#btnYes");
    this.btnNo = document.querySelector("#btnNo");
    if (closeBtn) {
      this.btnClose = document.querySelector("#btnClose");
    }
  }
  open(
    message: string,
    header: string,
    size?: string,
    deleteAll: boolean = false
  ) {
    this.modal.style.display = "block";
    this.modelHeader.innerHTML = header;
    this.modelBody.innerHTML = message;
    if (size) {
      this.modelContent.style.width = this.size[size] || this.size["sm"];
    }
    if (deleteAll) {
      this.btnYes.setAttribute("data-deleteAll", "");
      this.btnNo.setAttribute("data-deleteAll", "");
    } else {
      this.btnYes.removeAttribute("data-deleteAll");
      this.btnNo.removeAttribute("data-deleteAll");
    }
  }
  close() {
    this.modal.style.display = "none";
  }
}
export default Modal;
