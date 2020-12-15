import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { AmplifyAuthenticator, AmplifySignIn, AmplifySignUp, AmplifySignOut } from '@aws-amplify/ui-react';
import { Auth, Hub } from 'aws-amplify';
import './App.css';
import Windspeed from "./Windspeed";

function App() {
  const [user, updateUser] = React.useState(null);
  React.useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then(user => updateUser(user))
      .catch(() => console.log('No signed in user.'));
    Hub.listen('auth', data => {
      switch (data.payload.event) {
        case 'signIn':
          return updateUser(data.payload.data);
        case 'signOut':
          return updateUser(null);
      }
    });
  }, [])
  if (user) {
    return (
      <>    
        <div className="App-title">Wind Turbine Data Generator</div>
        <Windspeed />
     </>
    )
  }
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <AmplifyAuthenticator>
        <AmplifySignUp
          headerText="Windspeed Turbine UI Portal"
          slot="sign-up"
          formFields={[
            { type: "username",
              label: "Username",
              placeholder: "Username"
            },
            {
              type: "password",
              label: "Password",
              placeholder: "Password"
            },
            { type: "email",
              label: "Email",
              placeholder: "Enter valid email to get OTP"
          }
          ]} 
        />
          <AmplifySignIn headerText="Windspeed Turbine UI Portal" slot="sign-in"></AmplifySignIn>
      </AmplifyAuthenticator>
    </div>
  );
}
export default App;