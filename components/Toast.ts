import { AxiosError, AxiosResponse } from "axios";
import Swal from "sweetalert2";

const Toast = Swal.mixin({
  toast: true,
  position: "top-right",
  iconColor: "white",
  customClass: {
    popup: "colored-toast",
  },
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
});

export function requestErrorToast(err: AxiosError) {
  return Toast.mixin({
    icon: "error",
    title: (err.response?.data as any).message,
  });
}

export function requestSuccessToast(res: AxiosResponse) {
  return Toast.mixin({
    icon: "success",
    title: res.data.message,
  });
}

export default Toast;
