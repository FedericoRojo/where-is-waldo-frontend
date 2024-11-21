import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css'



function Home() {
  const navigate = useNavigate();
  const [scores, setScores] = useState([]);

  useEffect(() => {
    fetchScore();
  }, []);

  async function fetchScore(){
    try{
      const response = await fetch(`${import.meta.env.VITE_APP_API_BASE_URL}/winners`);
      if(!response.ok){
        throw new Error('Error while getting scores');
      }

      const json = await response.json();
      setScores(json.results);

    }catch(error){
      throw new Error(error.message);
    }
  }

  return (
    <div className='home-container'>
      <div className='go-play-container'>
        <img src='../assets/wally.png' alt="wally image"></img>
        <button onClick={() => navigate('/game')}>Play</button>
      </div>
      {  scores != null && scores.length != 0 && (
        <div className='scores-container'>
            <div className='score-option'> 
                  <p>Username</p>
                  <p>Time</p>
            </div>
            {console.log(scores)}
            {scores.map((elem, index) => (
              <div className='score-option' key={index}> 
                  <p>{elem.user_name}</p>
                  <p>{elem.time} s</p>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

export default Home
