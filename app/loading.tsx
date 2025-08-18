import { FadeLoader } from "react-spinners";

const LoadingPage = () => {
    return (
        <div className="flex-center" style={{
            height: '100vh',
            width: '100vw'
        }}>
            <FadeLoader color="#4A877E" />
        </div>
    );
}
 
export default LoadingPage;