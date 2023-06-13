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

export const deleteNewsPopup = DeletePopup.mixin({
  title: "Sei sicuro di voler cancellare la news?",
  text: "Non sarà possibile recuperare i dati una volta cancellati",
});

export const hideNewsPopup = DeletePopup.mixin({
  title: "Sei sicuro di voler nascondere la news?",
  text: "La news non sarà più visibile agli utenti.",
  confirmButtonText: "Si, nascondi",
});

export const showNewsPopup = DeletePopup.mixin({
  title: "Sei sicuro di voler mostrare la news?",
  text: "La news sarà visibile agli utenti.",
  confirmButtonText: "Si, mostra",
});

export default DeletePopup;
