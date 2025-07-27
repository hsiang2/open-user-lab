import { FadeLoader } from "react-spinners";

const LoadingPage = () => {
    return (
        <div className="flex-center" style={{
            height: '100vh',
            width: '100vw'
        }}>
            <FadeLoader />
        </div>
    );
}
 
export default LoadingPage;