import React, { useState, useEffect } from 'react';
import './App.css';
import { FaStar, FaCar, FaArrowLeft } from 'react-icons/fa';
import { CSSTransition } from 'react-transition-group';
import homer from './assets/homer.jpg';
import toretto from './assets/toretto.jpg';
import james from './assets/james.jpg';
import shopperlogo from './assets/shopperlogo.jpg';
import { RideConfirmInput } from './interfaces/RideConfirmInput';
import { DriverOption } from './interfaces/DriverOption';
import { RideHistoryOutput } from './interfaces/RideHistoryOutput';
import { MapComponentProps } from './interfaces/MapComponentProps';


const formatDuration = (duration: string) => {
  // Remove o "s" no final e converte para número
  const seconds = Number(duration.replace('s', ''));
  
  const days = Math.floor(seconds / (24 * 3600));
  const hours = Math.floor((seconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${days > 0 ? days + 'd ' : ''}${hours > 0 ? hours + 'h ' : ''}${minutes > 0 ? minutes + 'm ' : ''}${secs > 0 ? secs + 's' : ''}`;
};


function App() {
  const [customerId, setCustomerId] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState('');
  const [driverOptions, setDriverOptions] = useState<DriverOption[]>([]);
  const [showForm, setShowForm] = useState(true);
  const [showDrive, setShowDrive] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageColor, setMessageColor] = useState<string>('green');
  const [customerIdHistory, setCustomerIdHistory] = useState('');
  const [driveIdHistory, setDriveIdHistory] = useState('');
  const [rideHistory, setRideHistory] = useState<RideHistoryOutput | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [ridesPerPage] = useState(5);
  const [errorMessage, setErrorMessage] = useState('');



const handleSearch = async () => {
  if (!customerIdHistory) {
    setErrorMessage('Por favor, preencha o Identificador de Usuário.');
    setTimeout(() => {
      setErrorMessage('');
    }, 5000);
    return;
  }

  try {
    const response = await fetch(`http://localhost:8080/ride/${customerIdHistory}?driver_id=${driveIdHistory}`);
    if (!response.ok) {
      throw new Error('Erro na resposta do servidor');
    }
    const data: RideHistoryOutput = await response.json();
   
    setRideHistory(data);
    setShowForm(false);
    setShowDrive(false);
  } catch (error) {
    console.error('Erro ao buscar histórico de viagens:', error);
    setErrorMessage('Informe um dado válido.');
    setTimeout(() => {
      setErrorMessage('');
    }, 5000);
  }
};

  // Obtendo as viagens da página atual
  const indexOfLastRide = currentPage * ridesPerPage;
  const indexOfFirstRide = indexOfLastRide - ridesPerPage;
  const currentRides = rideHistory?.rides.slice(indexOfFirstRide, indexOfLastRide) || [];

  // Mudança de página
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleSubmit = async () => {
    const requestBody = {
      customer_id: customerId,
      origin: origin,
      destination: destination,
    };

    try {
      const response = await fetch('http://localhost:8080/ride/estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.status !== 200) {
        const errorData = await response.json();
        if(errorData.error_description){
          setMessage(errorData.error_description);
        } else {
          setMessage("Distância não permitida.")
        }
        
        setMessageColor('red');
        setTimeout(() => setMessage(null), 5000);
        return;
      }

      const data = await response.json();
      setDistance(data.distance);
      setDuration(data.duration);
      setDriverOptions(data.options); // Atualiza o estado com as opções de motoristas
      setShowForm(false);
      setShowDrive(true);
    } catch (error) {
      console.error('Erro ao buscar estimativa de viagem:', error);
    }
  };

  

  const handleChoose = async (option: DriverOption) => {
    const requestBody: RideConfirmInput = {
      customer_id: customerId,
      origin: origin,
      destination: destination,
      distance: distance, // Utiliza o valor da estimativa
      duration: duration, // Utiliza o valor da estimativa
      driver: {
        id: option.id,
        name: option.name,
      },
      value: option.value,
    };

    try {
      const response = await fetch('http://localhost:8080/ride/confirm', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.status === 406) {
        const errorData = await response.json();
        setMessage(`Erro de quilometragem inválida para o motorista ${option.name}: ${errorData.error_description}`);
        setMessageColor('red');
      } else if (response.status === 200) {
        const successData = await response.json();
        if (successData.success) {
          setMessage('Sucesso! Sua viagem foi solicitada.');
          setMessageColor('green');
        }
      }
    } catch (error) {
      console.error('Erro ao confirmar viagem:', error);
    } finally {
      setShowForm(true);
      setShowDrive(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };
  
  const MapComponent: React.FC<MapComponentProps> = ({ origin, destination }) => {
    const [mapUrl, setMapUrl] = useState('');
  
    useEffect(() => {
      const getMapUrl = async () => {
        const url = `https://maps.googleapis.com/maps/api/staticmap?size=600x400&path=color:0x0000ff|weight:5|${origin}|${destination}&key=${process.env.GOOGLE_API_KEY}`;
  
        setMapUrl(url);
      };
  
      getMapUrl();
    }, [origin, destination]);
  
    return (
      <div>
        <img src={mapUrl} alt="Google Map" />
      </div>
    );
  };



  const handleBack = () => {
    setShowForm(true);
    setShowDrive(false);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar key={index} color={index < rating ? 'gold' : 'lightgray'} />
    ));
  };

  const getProfileImage = (name: string) => {
    switch (name) {
      case 'Homer Simpson':
        return homer;
      case 'Dominic Toretto':
        return toretto;
      case 'James Bond':
        return james;
      default:
        return null;
    }
  };

  return (
    <>
    <img src={shopperlogo} alt="teste" style={{ width: '300px', height: 'auto' }} />

   
     {message && (
      <div className="message" style={{ color: messageColor, margin: '20px' }}>
        {message}
      </div>
    )}

      <CSSTransition
        in={showForm}
        timeout={500}
        classNames="fade"
        unmountOnExit
      >
        <div className="form-container">
        <h1 style={{ color: '#0d896d' }}>Buscar Viagens</h1> 
          <div className="button-row">
            <input
              type="text"
              placeholder="Identificador de Usuário"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              className="input-field"
            />
            <input
              type="text"
              placeholder="Endereço Origem"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="input-field"
            />
            <input
              type="text"
              placeholder="Endereço Destino"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="input-field"
            />
            <button onClick={handleSubmit}>
              Buscar
            </button>
          </div>
        </div>
        
      </CSSTransition>

      <CSSTransition
  in={showForm}
  timeout={500}
  classNames="fade"
  unmountOnExit
>
  <div className="form-container">
    <h1 style={{ color: '#0d896d' }}>Histórico Viagens</h1>
    {errorMessage && <div className="error-message">{errorMessage}</div>}
    <div className="button-row">
      <input
        type="text"
        placeholder="Identificador de Usuário"
        value={customerIdHistory}
        onChange={(e) => setCustomerIdHistory(e.target.value)}
        onKeyPress={(e) => {
          if (!/[0-9]/.test(e.key)) {
            e.preventDefault();
          }
        }}
        className="input-field"
      />
      <input
        type="text"
        placeholder="Identificador de Motorista"
        value={driveIdHistory}
        onChange={(e) => setDriveIdHistory(e.target.value)}
        onKeyPress={(e) => {
          if (!/[0-9]/.test(e.key)) {
            e.preventDefault();
          }
        }}
        className="input-field"
      />
      <button onClick={handleSearch}>Buscar</button>
    </div>
  </div>
</CSSTransition>


      <CSSTransition
        in={!showForm && showDrive}
        timeout={500}
        classNames="fade"
        unmountOnExit
      >
        <div className="driver-options-container">
          <button style={{ color: '#0d896d' }} className="back-button" onClick={handleBack}>
            <FaArrowLeft />
          </button>
          <h1 style={{ color: '#0d896d' }}>Buscar Viagens</h1>
          <div style={{margin: '20px'}}> 
            <MapComponent origin={origin} destination={destination} />
          </div>
          <div className="driver-options">
            {driverOptions.map((option) => (
              <div className="driver-card">
              {getProfileImage(option.name) && (
                <div className="profile-container">
                  <div className="rating">{renderStars(option.review.rating)}</div>
                  <img
                    src={getProfileImage(option.name)!}
                    alt={option.name}
                    className="profile-pic"
                  />
                </div>
              )}
              <h3 className="driver-name">{option.name}</h3>
              <div>
                <p style={{padding: '5px' }}>
                  Valor: R$ {option.value.toFixed(2)}
                </p>
                <button
                  className="choose-button"
                  style={{ backgroundColor: '#0d896d', color: 'white' }}
                  onClick={() => handleChoose(option)}
                >
                  Escolher
                </button>
              </div>
              <p>
                <FaCar /> {option.vehicle}
              </p>
              <p>{option.description}</p>             
            </div>
            
            ))}
          </div>
        </div>
      </CSSTransition>
      <CSSTransition in={!showForm && !showDrive} timeout={500} classNames="fade" unmountOnExit>
  <div className="history-container">
    <button style={{ color: '#0d896d' }} className="back-button" onClick={handleBack}>
      <FaArrowLeft />
    </button>
    <h1 style={{ color: '#0d896d' }}>Histórico de Viagens</h1>
    <table className="history-table">
      <thead>
        <tr>
          <th>Data e Hora</th>
          <th>Nome do Motorista</th>
          <th>Origem</th>
          <th>Destino</th>
          <th>Distância</th>
          <th>Tempo</th>
          <th>Valor</th>
        </tr>
      </thead>
      <tbody>
        {currentRides.map((ride, index) => (
          <tr key={index}>
            <td>{new Date(ride.date).toLocaleString()}</td>
            <td>{ride.driver.name}</td>
            <td>{ride.origin}</td>
            <td>{ride.destination}</td>
            <td>{Math.floor(ride.distance / 1000)} km</td>
            <td>{formatDuration(ride.duration)}</td>
            <td>R$ {ride.value.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <div  className="pagination">
      {Array.from({ length: Math.ceil((rideHistory?.rides.length || 0) / ridesPerPage) }, (_, index) => (
        <button style={{ color: '#0d896d', margin: '5px' }} key={index} onClick={() => paginate(index + 1)}>
          {index + 1}
        </button>
      ))}
    </div>
  </div>
</CSSTransition>
    </>
  );
}

export default App;
