import { IoMdArrowBack } from "react-icons/io";
import { useRouter } from "next/router";

function BackButton() {
    const router = useRouter();

    return (
        <button
            className="flex justify-center items-center p-1 h-10 w-10 mr-8 bg-white border-[1px] border-grayBorder rounded-full hover:bg-controlHoverBackground active:bg-controlActiveBackground"
            onClick={router.back}
        >
            <IoMdArrowBack className="h-6 w-6" />
        </button>
    );
}

export default BackButton;