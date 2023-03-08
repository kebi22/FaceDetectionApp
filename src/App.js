
import './App.css';
import React, { Component } from 'react';
//import Particles from 'react-particles';
import Navigation from './componenet/Navigation/Navigation';
import Logo from './componenet/Logo/Logo';
import Signin from './componenet/signIn/Signin';
import ImageLinkForm from './componenet/ImageLinkForm/ImageLinkForm';
import Rank from './componenet/Rank/Rank';
import FaceRecognition from './componenet/FaceRecognition/FaceRecognition';
import Register from './componenet/Register/Register';

//import Clarifai from 'clarifai';

/*const app = new Clarifai.App({
  apiKey: '32e326c80b494f42b25c09c631127b1e'
 });
*/
/*const particlesOptions = {
     particles: {
      number: {
      value: 30,
        density: {
          enable: true,
        value_area: 800
        }
       }
     }
   }*/


class App extends Component {
  constructor(){
    super();
    this.state={
      input:'',
      imageUrl:'',
      box:{},
      route:'signin',
      isSignedIn: false,
      user:{
        id:'',
        name:'',
        email:'',
        entries:0,
        joined: new Date()
      }
    }
  }
  loaduser=(data)=>{
    this.setState({user:{
      id:data.id,
        name:data.name,
        email:data.email,
        entries:data.entries,
        joined:data.joined
    }})
  }
  
  calculateFaceLocation=(data)=>{
    const clarifaiFace= data.outputs[0].data.regions[0].region_info.bounding_box;
  const image=document.getElementById('inputImage')
  const width= Number(image.width);
  const height= Number(image.height);
  return{
    leftCol: clarifaiFace.left_col*width,
    topRow: clarifaiFace.top_row*height,
    rightCol: width- (clarifaiFace.right_col*width),
    bottomRow: height- (clarifaiFace.bottom_row*height)
   }
  }
  displayFaceBox=(box)=>{
    console.log(box); 
    this.setState({box:box})
  }
  onInputChange=(event)=>{
    event.preventDefault();
    this.setState({input:event.target.value});
   

  }
  onButtonSubmit=()=>{
    this.setState({imageUrl:this.state.input});
    const USER_ID = 'dkto5t3khqy5';
    // Your PAT (Personal Access Token) can be found in the portal under Authentification
    const PAT = '7b63c8b9572645f896df94dade8492f9';
    const APP_ID = 'a1b2c3';
    // Change these to whatever model and image URL you want to use
    const MODEL_ID = 'face-detection';
    const MODEL_VERSION_ID = '6dc7e46bc9124c5c8824be4822abe105';    
    const IMAGE_URL = this.state.input;

    ///////////////////////////////////////////////////////////////////////////////////
    // YOU DO NOT NEED TO CHANGE ANYTHING BELOW THIS LINE TO RUN THIS EXAMPLE
    ///////////////////////////////////////////////////////////////////////////////////

    const raw = JSON.stringify({
        "user_app_id": {
            "user_id": USER_ID,
            "app_id": APP_ID
        },
        "inputs": [
            {
                "data": {
                    "image": {
                        "url": IMAGE_URL
                    }
                }
            }
        ]
    });

    const requestOptions = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Key ' + PAT
        },
        body: raw
    };

    // NOTE: MODEL_VERSION_ID is optional, you can also call prediction with the MODEL_ID only
    // https://api.clarifai.com/v2/models/{YOUR_MODEL_ID}/outputs
    // this will default to the latest version_id

    fetch("https://api.clarifai.com/v2/models/" + MODEL_ID + "/versions/" + MODEL_VERSION_ID + "/outputs", requestOptions)
        .then(response => response.json())
        .then(result => 
          {if (result){
            fetch('http://localhost:3000/image', {
              method: 'put',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                id: this.state.user.id
              })
          }).then(response=>response.json())
          .then(count=>{
            this.setState(Object.assign(this.state.user,{entries:count})
          )
          })
        
        }
            this.displayFaceBox(this.calculateFaceLocation(result))})
        .catch(error => console.log('error', error));

   /*app.models.predict(
      Clarifai.COLOR_MODEL,this.state.input
      ).then(
    function(response){
      console.log(response)

    },
    function(err){

    }
    );*/
  }
    onRouteChange=(route)=>{
      if(route==='signout'){
      this.setState({isSignedIn:false})
      }
      else if(route==='home'){
        this.setState({isSignedIn:true})
      }
      this.setState({route:route});
    }

  
  render(){
  return (
    <div className="App">
      
     
     <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange} />
     { this.state.route==='home'?
     <div>
         <Logo/>
      <Rank name={this.state.user.name} entries={this.state.user.entries}/>  
     <ImageLinkForm 
     onButtonSubmit={this.onButtonSubmit} 
     onInputChange={this.onInputChange}/>
   <FaceRecognition box={this.state.box}
   imageUrl={this.state.imageUrl}/>
     </div>

      :(this.state.route==='signin'?
      <Signin loaduser={this.loaduser} onRouteChange={this.onRouteChange}/>
      :
      <Register loaduser={this.loaduser}onRouteChange={this.onRouteChange}/>)


      

   }
    </div>
  );
}
}

export default App;
