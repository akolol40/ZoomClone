import React from 'react'
import HomeScreen from './screen/Homescreen'
import Watch from './screen/Watch'
import {
  Route,
  Switch,
  Redirect,
  withRouter,
  BrowserRouter
} from "react-router-dom"

const App = (props) => {
    return (
     <BrowserRouter>
     <Switch>
       <Route exact path={'/'} component={HomeScreen} />
       <Route path="/:id" component={Watch}/>
     </Switch>
     
     </BrowserRouter>

    )
}

export default App