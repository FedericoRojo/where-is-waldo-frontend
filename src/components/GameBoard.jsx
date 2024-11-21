import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/GameBoard.css';
const images = { odlaw: "../assets/odlaw.gif", wally: '../assets/wally.png' , wizard: '../assets/wizard.gif'}

function GameBoard() {
    const navigate = useNavigate();
    const [seconds, setSeconds] = useState(0);
    const [playing, setPlaying] = useState(true);
    const [fetchDone, setFetchDone] = useState(false);
    const [username, setUsername] = useState('');
    const [coordinates, setCoordinates] = useState({x:0, y:0});
    const [coordinatesBackend, setCoordinatesBackend] = useState({x:0, y:0, r:0});
    const [radious, setRadious] = useState(50);
    const [characters, setCharacters] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showCursor, setShowCursor] = useState(true);
    const [showFeedback, setShowFeedback] = useState(false);

    useEffect(() => {
        fetchCharacters();
        setFetchDone(true);
    },[]);

    useEffect(() => {
        if(fetchDone){
            let interval;
            if (playing) {
            interval = setInterval(() => {
                setSeconds((prev) => prev + 1);
            }, 1000);
            }
        
            return () => clearInterval(interval); 
        }
    }, [playing, fetchDone]);

    useEffect( () => {
        if(fetchDone){
            let endCheck = false;
            for(let i = 0; i < characters.length && endCheck == false; i++){
                if( characters.length != 0 && characters[i].solved == false){
                    console.log(characters[i].solved);
                    endCheck = true;
                }
            }
            if(endCheck == false && characters.length != 0){ //each character has status true, so everyone was selected
                win();
            }
        }
    }, [characters, fetchDone]);

   
    
    function win() {
        setPlaying(false);
        console.log(seconds);
    }

    const handleClick = (e) => {
        if(showCursor){
            const rect = e.target.getBoundingClientRect();
            //Coordinates for rendering
            const x = e.clientX - rect.left; 
            const y = e.clientY - rect.top;  

            //Coordinates for backend
            const normalizedX = (e.clientX - rect.left) / rect.width;
            const normalizedY = (e.clientY - rect.top) / rect.height;
            const normalizedRadious = radious / rect.width;

            setCoordinates({ x, y });
            setCoordinatesBackend({x: normalizedX, y: normalizedY, r: normalizedRadious});
            setShowForm(true); 
            setShowCursor(false);
        }else{
            removeCursor();
        }
    };

   

    async function fetchCharacters(){
        try{
            const response = await fetch(`${import.meta.env.VITE_APP_API_BASE_URL}/characters`);
            if(!response.ok){
                throw new Error('Error while fetching characters');
            }else{
                const json = await response.json();
                const updatedArray = json.result.map( elem => ({
                    ...elem,
                    solved: false
                }) );
                setCharacters(updatedArray);
            }
        }catch(error){
            throw new Error(error.message);
        }
    }

    const removeCursor = () => {
        setShowCursor(true);
        setShowForm(false); 
        setCoordinates({ x: 0, y: 0 });
    }

    const handleSelect = async (id) => {
        
        try{
            const response = await fetch(`${import.meta.env.VITE_APP_API_BASE_URL}/checkValid`,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    x: coordinatesBackend.x,
                    y: coordinatesBackend.y,
                    r: coordinatesBackend.r,
                    characterId: id
                })
            });
            if(!response.ok){
                throw new Error('Error while validating');
            }else{
                const json = await response.json();
                
                if(json.success == true){
                    setShowFeedback(true);
                    setTimeout(() => {
                        setShowFeedback(false); 
                        removeCursor();
                    }, 1000);
                    
                    setCharacters(prevArray => {
                        const updatedArray = [...prevArray];
                        updatedArray[id-1].solved = true;
                        return updatedArray;
                    });
                    
                }else{
                    removeCursor();      
                }
            }
        }catch(error){
            setError(error.message);
        }
        
    }
  
    async function handleSubmit(e) {
        e.preventDefault();
        try{
            const response = await fetch(`${import.meta.env.VITE_APP_API_BASE_URL}/winner`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    time: seconds
                })
            });
            if(!response.ok){
                throw new Error('Error while posting winner');
            }else{
                navigate('/');
            }
        }catch(error){
            throw new Error(error.message);
        }
    }

  return (
    <div className="game-general-container">
        <div className="game-header">
            <h3 onClick={() => navigate('/')} className="header-title">Home</h3>
            <div className="header-characters-container">
                {characters.map((elem) => (
                    <div
                        className={`header-character ${elem.solved ? 'solved' : ''}`}
                        key={elem.id}
                    >
                        <img src={images[elem.img]} alt={elem.name} />
                        <p>{elem.name}</p>
                    </div>
                ))}
            </div>
            <h3 className="header-timer">Time</h3>
        </div>

        {playing == false && (
        <div className='winner-container'>
            <form onSubmit={handleSubmit}>
                <label htmlFor="username">Username:</label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    onChange={e => setUsername(e.target.value)}  
                />
                <p>Your time: {seconds}</p>
                <button type="submit">Save</button>
            </form>
        </div>
        )}   

        <div className="game-image-container">
            <img
                src="../assets/whereswaldo.jpg"
                alt="Game image"
                onClick={handleClick}
                className="game-image"
            />

            {coordinates.x !== 0 || coordinates.y !== 0 ? (
                <div
                    className="highlight-circle"
                    style={{
                        top: `${coordinates.y - radious/2}px`,
                        left: `${coordinates.x - radious/2}px`,
                        width: `${radious}px`,
                        height: `${radious}px`,
                    }}
                ></div>
            ) : null}

            {showForm && (
                <div
                    className="form-container"
                    style={{
                        top: `${coordinates.y}px`,
                        left: `${coordinates.x + radious}px`,
                    }}
                >
                    {showFeedback && (
                        <div className="form-feedback correct">
                            <p>Correct option clicked</p>
                        </div>
                    )}
                    {characters.map((elem) => {
                        if (!elem.solved) {
                            return (
                                <div
                                    className="form-options"
                                    onClick={() => handleSelect(elem.id)}
                                    key={elem.id}
                                >
                                    <img src={images[elem.img]} alt={elem.name} />
                                    <p>{elem.name}</p>
                                </div>
                            );
                        }
                    })}
                </div>
            )}
        </div>
    </div>

  )
}

export default GameBoard;
