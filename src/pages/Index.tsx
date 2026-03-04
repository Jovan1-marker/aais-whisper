import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SubmitCard from "@/components/SubmitCard";

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col items-center px-4 py-10 md:py-16">
        <h2 className="mb-2 text-center text-3xl font-extrabold text-primary md:text-4xl">
          🗣️ Speak Up. Be Heard.
        </h2>
        <p className="mb-8 text-center text-base text-muted-foreground md:text-lg">
          Where voices unite to build a better AAIS.
        </p>
        <SubmitCard />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
