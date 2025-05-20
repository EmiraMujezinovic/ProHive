import { useNavigate } from 'react-router-dom';

const ChooseRole = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="bg-white rounded shadow p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-text">Choose your role</h2>
        <div className="flex flex-col gap-6">
          <button
            onClick={() => navigate('/registerclient')}
            className="w-full py-4 rounded-lg bg-primary text-text font-semibold text-lg shadow hover:bg-accent transition"
          >
            Client
          </button>
          <button
            onClick={() => navigate('/registerfreelancer')}
            className="w-full py-4 rounded-lg bg-primary text-text font-semibold text-lg shadow hover:bg-accent transition"
          >
            Freelancer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChooseRole;
