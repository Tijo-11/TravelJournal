import { Link } from "react-router-dom";
import Footer from "../components/Footer";

function NotFound() {
  return (
    <div className="container mx-auto p-4 text-center">
      <h1 className="text-4xl font-bold text-red-600 mb-4">
        404 - Page Not Found
      </h1>
      <p className="text-lg mb-6">The page you're looking for doesn't exist.</p>
      <Link
        to="/home"
        className="bg-blue-600 text-white font-semibold px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Go to Home
      </Link>
      <Footer />
    </div>
  );
}

export default NotFound;
