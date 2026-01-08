
export const Baslik = () => {
  return (
    <header className="relative gradient-background">
      {
    }
      <style>
        {`
          .gradient-background {
            background: linear-gradient(300deg, #00bfff, #ff4c68, #ef8172);
            background-size: 100% 100%;
            animation: gradient-animation 18s ease infinite;
          }

          @keyframes gradient-animation {
            0% {
              background-position: 0% 25%;
            }
            50% {
              background-position: 100% 25%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
        `}
      </style>

      <div
        className="relative h-40 bg-center bg-cover"
      >
        <div className="absolute inset-0 bg-opacity-60 flex justify-center items-center">
        </div>
      </div>
    </header>
  );
};
export default Baslik