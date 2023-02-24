import Swal from "sweetalert2";

const DeletePopup = Swal.mixin({
  icon: "warning",
  confirmButtonText: "Si, cancella",
  showCancelButton: true,
  cancelButtonColor: "green",
  cancelButtonText: "No, annulla",
  confirmButtonColor: "red",
  showLoaderOnConfirm: true,
});

export const DeleteCategoryPopup = DeletePopup.mixin({
  title: `Sei sicuro di voler cancellare la categoria?`,
  text: 'Cancellare una categoria porterà tute le sue news a essere considerate come "Generali" ',
});

export default DeletePopup;
