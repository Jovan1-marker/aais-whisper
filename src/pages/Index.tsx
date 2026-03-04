import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SubmitCard from "@/components/SubmitCard";

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 md:py-16">
        <div className="w-full max-w-3xl text-center">
          <h2 className="mb-3 text-3xl font-extrabold text-primary md:text-4xl lg:text-5xl">
            🗣️ Speak Up. Be Heard.
          </h2>
          <p className="mb-10 text-lg text-muted-foreground md:text-xl">
            Share your suggestions, concerns, feedback, or appreciation anonymously.
            <br />
            Together, we make Army's Angels Integrated School better.
          </p>

          {/* The submit form card — centered and responsive */}
          <SubmitCard />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;