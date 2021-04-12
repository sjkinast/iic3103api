import React, {useState, useEffect}  from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useRouteMatch,
  useParams,
  useHistory,
} from "react-router-dom";

export default function App() {
  const [characters, setCharacters] = useState([]);
  const [offset, setOffset] = useState(0);
  const [value, setValue] = useState('');
  return (
    <Router>
      <div>
        <div>
          <h1>Tarea 1 Santiago Kinast</h1>
          <SearchForm setCharacters={setCharacters} value={value} setValue={setValue} setOffset={setOffset} />
        </div>
        <ul>
          <li>
            <Link to="/breaking_bad">Breaking Bad</Link>
          </li>
          <li>
            <Link to="/better_call_saul">Better Call Saul</Link>
          </li>
        </ul>

        <Switch>
          <Route path="/breaking_bad">
            <Seasons />
          </Route>
          <Route path="/better_call_saul">
            <Seasons />
          </Route>
          <Route path="/search_results">
            <SearchResults characters={characters} />
            <Back value={value} offset={offset} setOffset={setOffset} setCharacters={setCharacters}/>
            <Next value={value} offset={offset} setOffset={setOffset} setCharacters={setCharacters}/>
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

const Seasons = () => {
  let match = useRouteMatch();
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [episodesBreakingBad, setEpisodesBreakingBad] = useState([]);
  const [episodesBetterCallSaul,setEpisodesBetterCallSaul] = useState([]);
  useEffect(() => {
    const url = 'https://tarea-1-breaking-bad.herokuapp.com/api/episodes/';
    fetch(url).then(res => res.json()).then(
      (result) => {
        setEpisodesBreakingBad(result.filter((episode) => {
          if (episode.series === 'Breaking Bad') {
            return true;
          }
          return false;
        }));
        setEpisodesBetterCallSaul(result.filter((episode) => {
          if (episode.series === 'Better Call Saul') {
            return true;
          }
          return false;
        }));
        setIsLoaded(true);
      },
      (error) => {
        setIsLoaded(true);
        setError(error);
      }
    );
  }, []);
  if (error) {
    return <p>Error: {error.message}</p>
  } else if (!isLoaded) {
    return <p>Cargando...</p>
  }
  return (
    <div>
      <h2>Temporadas</h2>
      <ul>
        {match.url === '/breaking_bad' ? 
        [...new Set(episodesBreakingBad.map((episode) => episode.season)) ].map((_, index) => 
          <li key={index}>
            <Link to={`${match.url}/${index + 1}`}>Temporada {index + 1}</Link>
          </li>
        ) :
        [...new Set(episodesBetterCallSaul.map((episode) => episode.season)) ].map((_, index) => 
          <li key={index}>
            <Link to={`${match.url}/${index + 1}`}>Temporada {index + 1}</Link>
          </li>
        )}
      </ul>
      <Switch>
        <Route path={`${match.path}/:seasonId`}>
          <SeasonInfo episodes={match.url === '/breaking_bad' ? episodesBreakingBad : episodesBetterCallSaul} />
        </Route>
        <Route path={match.path}>
          <h3>Porfavor seleccione una Temporada.</h3>
        </Route>
      </Switch>
    </div>
  );
};

const SeasonInfo = ({ episodes }) => {
  let { seasonId } = useParams();
  let match = useRouteMatch();
  return (
    <div>
      <h3>Episodios Temporada {seasonId}</h3>
      <ul>
        {episodes?.filter((episode) => {
          if (episode.season === seasonId.toString()){
            return true;
            }
          return false;
        }).map((episode, index) => 
          <li key={index}>
            <Link to={`${match.url}/${episode.episode_id}`}>
            E {episode.episode} | {episode.title} | {episode.air_date} | {episode.episode_id}
            </Link>
          </li>
        )}
      </ul>
      <Switch>
        <Route path={`${match.path}/:episodeId`}>
          <EpisodeInfo />
        </Route>
        <Route path={match.path}>
          <h3>Porfavor seleccione un Episodio.</h3>
        </Route>
      </Switch>
    </div>
  );
};

const EpisodeInfo = () => {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [episode, setEpisode] = useState();
  let { episodeId } = useParams();
  useEffect(() => {
    const url = `https://tarea-1-breaking-bad.herokuapp.com/api/episodes/${episodeId}`;
    fetch(url).then(res => res.json()).then(
      (result) => {
        setEpisode(result[0]);
        setIsLoaded(true);
      },
      (error) => {
        setIsLoaded(true);
        setError(error);
      }
    )
  }, [episodeId]);
  return (
    <div>
      {error ? 
      <p>Error: {error.message}</p>
       : !isLoaded ? 
      <p>Cargando...</p> : 
      <Episode episode={episode}/>}
    </div>
  );
};

const Episode = ({ episode }) => {
  let match = useRouteMatch();
  if (episode){
    return (
      <div>
        <h3>Episodio {episode.episode}</h3>
        <ul>
          <li>Código de Episodio: {episode.episode_id}</li>
          <li>Nombre: {episode.title}</li>
          <li>Serie: {episode.series}</li>
          <li>Fecha en que estuvo al aire: {episode.air_date}</li>
          <li>Temporada: {episode.season}</li>
          <li>{episode.characters.length} personajes:</li>
          <ul>
          {episode.characters.map((character, index) => 
            <li key={index}>
              <Link to={`${match.url}/${character}`}>{character}</Link>
            </li>)
          }
          </ul>
        </ul>
        <Switch>
          <Route path={`${match.path}/:characterName`}>
            <CharacterInfo />
          </Route>
          <Route path={match.path}>
            <h3>Porfavor seleccione un Personaje.</h3>
          </Route>
      </Switch>
      </div>
    );
  }
  return <p>Cargando...</p>;
};

const CharacterInfo = () => {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [character, setCharacter] = useState();
  let { characterName } = useParams();
  useEffect(() => {
    const url = `https://tarea-1-breaking-bad.herokuapp.com/api/characters?name=${characterName.replace(' ', '+')}`;
    fetch(url).then(res => res.json()).then(
      (result) => {
        setCharacter(result[0]);
        setIsLoaded(true);
      },
      (error) => {
        setIsLoaded(true);
        setError(error);
      }
    );
  },[characterName]);
  if (error) return <p>Error: {error.message}</p>
  else if (!isLoaded) return <p>Cargando...</p>

  return (
    <div>
      <ul>
        <li><Character character={character}/></li>
      </ul>
    </div>
  );
};

const Character = ({ character }) => {
  const [quotes, setQuotes] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  useEffect(()=> {
    const url = `https://tarea-1-breaking-bad.herokuapp.com/api/quote?author=${character?.name.replace(' ', '+')}`;
    fetch(url).then(res => res.json()).then((result) => {
      setQuotes(result);
      setIsLoaded(true);
    }, (error) => {
      setIsLoaded(true);
      setError(error);
    });
  }, [character]);
  if (error) return <p>Error: {error.message}</p>
  else if (!isLoaded || !character) return <p>Cargando...</p>
  return (
    <div>
      <h3>{character.name}</h3>
      <img alt={character.char_id.toString()} src={character.img} width={'30%'} height={'30%'}/>
      <ul>
        <li>Id Personaje: {character.char_id}</li>
        <li>Estado: {character.status}</li>
        <li>Sobrenombre: {character.nickname}</li>
        <li>Retratada: {character.portrayed}</li>
        <li>Categoria: {character.category}</li>
        <li>Ocupación:</li>
        <ul>
          {character.occupation.map((oc, index) => <li key={index}>{oc}</li>)}
        </ul>
        {character.appearance.length > 0 ? <li>Temporadas Breaking Bad:</li> : ''}
        <ul>
          {character.appearance.map((number, index) => <li key={index}><Link to={`/breaking_bad/${number}`}>{number}</Link></li>)}
        </ul>
        {character.better_call_saul_appearance.length > 0 ? <li>Temporadas Better Call Saul:</li> : ''}
        <ul>
          {character.better_call_saul_appearance.map((number, index) => <li key={index}><Link to={`/better_call_saul/${number}`}>{number}</Link></li>)}
        </ul>
        <li>Citas:</li>
        <ul>
          {quotes.map((quote, index) => <li key={index}>{quote.quote}</li>)}
        </ul>
      </ul>
    </div>
  );
};

const SearchForm = ({ setCharacters, value, setValue, setOffset}) => {
  const history = useHistory();
  const handleSubmit = (event) => {
    setOffset(0);
    const url = `https://tarea-1-breaking-bad.herokuapp.com/api/characters?name=${value.replace(' ', '+')}&limit=1&offset=0}`;
    fetch(url).then(res => res.json()).then(
      (result) => {
        setCharacters(result);
      },
      (error) => {
        alert(error.message);
      }
    )
    history.push('/search_results');
    event.preventDefault();
  };
  const handleChange = (event) => setValue(event.target.value);
  return (
    <form onSubmit={handleSubmit}>
      <label>
        <p>Busque Personaje: </p>
        <input type="text" value={value} onChange={handleChange} />
      </label>
      <input type="submit" value="Submit" />
  </form>
  );
}; 

const Next = ({ value, offset,setOffset, setCharacters }) => {
  const handleClick = (event) => {
    const help_offset = offset + 1;
    const url = `https://tarea-1-breaking-bad.herokuapp.com/api/characters?name=${value.replace(' ', '+')}&limit=1&offset=${help_offset}`;
    fetch(url).then(res => res.json()).then(
      (result) => {
        if (result.length > 0) {
          setCharacters(result);
          setOffset(offset + 1);
        }
      },
      (error) => {
        alert(error.message);
      }
    );

    event.preventDefault();
  };
  return (
    <button onClick={handleClick}>Siguiente</button>
  );

};

const Back = ({ value, offset, setOffset, setCharacters }) => {
  const handleClick = (event) => {
    const help_offset = offset - 1;
    if (help_offset < 0) return ;
    const url = `https://tarea-1-breaking-bad.herokuapp.com/api/characters?name=${value.replace(' ', '+')}&limit=1&offset=${help_offset}`;
    fetch(url).then(res => res.json()).then((result) => {
      if (result.length > 0) {
        setCharacters(result);
        setOffset(offset - 1);
      }
    }, (error) => {
      alert(error.message);
    });
    event.preventDefault();
  };
  return (
    <button onClick={handleClick}>Atras</button>
  );
};

const SearchResults = ({ characters }) => (
  <div>
    <h3>Resultados de búsqueda: </h3>
    <ul>
      {characters.map((character, index) => <li key={index}><div>
        <Character character={character}/>
        </div></li>)}
    </ul>
  </div>
);

