import React, {useEffect, useState} from 'react';
import { useForm } from "react-hook-form";
import './App.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSync, faSave } from "@fortawesome/free-solid-svg-icons";
import Amplify, {API} from 'aws-amplify';
import awsconfig from './aws-exports';
import * as mutations from './graphql/mutations';
import * as queries from './graphql/queries';
import ddblogo from './images/Amazon-DynamoDB_lgt.png'
import toast from "light-toast";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import {
  ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, LineChart, Line,
} from 'recharts';
Amplify.configure(awsconfig);

function Windspeed() {
  
  const [mylist, setMyList] = useState([]);
  const [myIndex, setMyIndex] = useState();
  const [mySortedlist, setMySortedList] = useState([]);
  const [loop, setLoop] = useState(10);
  const [lower, setLower] = useState(25);
  const [upper, setUpper] = useState(70);
  const [animation, setAnimation]= useState("false")

  useEffect(() => {
    updateVals();
  }, []);

  const updateVals = async() =>{
    const result = await API.graphql({
      query: queries.listWindspeeds,
      fetchPolicy: "no-cache",
    });
    setMyList(result.data.listWindspeeds.items);
    setMyIndex(result.data.listWindspeeds.items.length);
  };

  async function genValues () {
    for (let i = 0, j=myIndex; i < loop; i++) {
      const generateValues = { 
        index: i+j,
        deviceID: "device" + (Math.floor(Math.random() * 5) + 1),
        value: Math.floor(Math.random() * (upper-lower)) + lower
      };
      await API.graphql({ query: mutations.createWindspeed, variables: { input: generateValues}});
      setMyIndex(myIndex+1);
    }
  }

  function generate () {
    genValues();
    toast.success(`Generating ${loop} values between ${lower} and ${upper}`, 1000, () => {
        updateVals();
    }); 
  }

  const refresh = () => {
    toast.success(`Fetcing values from DynamoDB`, 1000, () => {
      updateVals();
    }); 
  }

  const myChartArray = [];
  const generateKeyValePairs = (arraytoupdated) => {
    mylist.map((item) => {
    var objNeeded = { name: 'init', value: -1};
    objNeeded['name'] = item.index;
    objNeeded['value'] = item.value;
    arraytoupdated.push(objNeeded);
    });
  }
  generateKeyValePairs(myChartArray);

  function CustomizedLabel(props) {
    const { x, y, stroke, value } = props;
    if (value > 55 || value < 30) {
    return (
      <text x={x} y={y} dy={-4} fill="red" fontSize={10} textAnchor="middle">
        {value}
      </text>
    );
    }else{
      return (
        <text x={x} y={y} dy={-4} fill="green" fontSize={10} textAnchor="middle" >
          {value}
        </text>
      );
    }
  }

  function CreateLineChart(val){
    return(
      <ResponsiveContainer width="100%" minHeight={400}>
        <LineChart
          data={val.data}
          margin={{
            top: 20, right: 20, left: 20, bottom: 10,
          }}
          >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis tick={true}/>
          <YAxis tick={true}/>
          <Tooltip />
          <Line type="monotone" isAnimationActive={false} dataKey="value" stroke="#8884d8" strokeWidth={2} label={<CustomizedLabel />} />
        </LineChart>
      </ResponsiveContainer>
      )
  }

  
  const schema = yup.object().shape({
    numberofvals: yup.number().positive().integer().required(),
    lowerLimit: yup.number().positive().integer().required(),
    upperLimit: yup.number().positive().integer().required(),
  });

  const { handleSubmit, register, errors } = useForm({resolver: yupResolver(schema)});
  const onSubmit = data => {
    toast.success(`Updating Values: ${loop} Min: ${lower} Max: ${upper}`, 500, () => {
      console.log('data->',data);
      setLoop(data.numberofvals);
      setLower(data.lowerLimit);
      setUpper(data.upperLimit);
    });
  }

  return (
    <div className="App">
      {/* <AmplifySignOut /> */}
      {/* {console.log(mylist.length)} */}
      <header className="App-header">
      <div className="App-form">
        <form onSubmit={handleSubmit(onSubmit)}>
          
          <label>Values</label>
          <input name="numberofvals" defaultValue={loop} type="number" min ="1" max="99"
          ref={register({ min: 10, max: 99 })} 
          onChange={e => setLoop(e.target.value)}
          />

          <label>Min</label>
          <input name="lowerLimit" defaultValue={lower} type="number" min ="1" max="99"
          ref={register({ min: 10, max: 99 })} 
          onChange={e => setLower(e.target.value)}
          />

          <label>Max</label>
          <input name="upperLimit" defaultValue={upper} type="number" min ="1" max="99"
          ref={register({ min: 10, max: 99 })} 
          onChange={e => setUpper(e.target.value)}
          />            
          <button type="submit">Save {" "}<FontAwesomeIcon icon={faSave} /></button>

          </form>
        </div>

        <div className="App-buttons">
          <button onClick={generate}>
            Generate data
          </button>

          <button onClick={refresh}>
            <FontAwesomeIcon icon={faSync}/>
          </button>
        
        <a href="https://us-west-2.console.aws.amazon.com/dynamodb/home?region=us-west-2#tables:" target="_blank" rel="noopener noreferrer">
          <img src={ddblogo} alt="Logo" />
        </a> 
        </div>
        <CreateLineChart data={myChartArray} />
        <div className="App-info">
        <p>Every wind turbine has a range of wind speeds, typically around 30 to 55 mph. Speed other than this range is detected anomalous{" "}
        <a href="https://www.wind-watch.org/faq-output.php" target="_blank" rel="noopener noreferrer">
        (Source)
        </a>
        </p>
        </div>
      </header>
    </div>
  );
}

export default Windspeed;
