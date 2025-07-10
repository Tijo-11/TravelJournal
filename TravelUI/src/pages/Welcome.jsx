import React from "react";
import Footer from "../components/Footer";

const Welcome = () => {
  return (
    <>
      <div className="flex flex-col items-center p-6">
        <h1 className="text-3xl font-bold mb-4">Welcome Traveller!</h1>

        <div className="grid md:grid-cols-2 gap-8 mb-10 w-full max-w-5xl">
          <img
            src="/images/hike_waterfall.jpg"
            alt="Hiking waterfall"
            className="rounded-2xl shadow-lg object-cover w-full h-64 order-1"
          />
          <div className="flex flex-col justify-center order-2">
            <p className="text-lg mb-4">
              "When something good happens, travel to celebrate; when something
              bad happens, travel to overcome it; when nothing happens, travel
              to make something happen."
            </p>
          </div>

          <div className="flex flex-col justify-center order-3">
            <p className="text-lg mb-4">
              Hey traveller, share your stories as well as plan your next
              journey here.
            </p>
          </div>
          <img
            src="/images/open_long_path.webp"
            alt="Open path"
            className="rounded-2xl shadow-lg object-cover w-full h-64 order-4"
          />
        </div>

        <img
          src="/images/travel_journal_book.avif"
          alt="Travel journal book"
          className="rounded-xl shadow-xl w-full max-w-3xl"
        />
      </div>
      <Footer />
    </>
  );
};

export default Welcome;
