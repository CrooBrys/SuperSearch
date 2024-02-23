import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import DOMPurify from 'dompurify';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent  {
  //delaying page refresh due to form
  submitForm(event: Event) {
    if (event) {
      //preventing form submission
      event.preventDefault();
    }
  }
  //creating function to signUp
  signUp(){
    //getting inputs
    let enteredNickname = DOMPurify.sanitize((document.getElementById("username") as HTMLInputElement).value);
    let enteredPassword = DOMPurify.sanitize((document.getElementById("password") as HTMLInputElement).value);
    let enteredEmail = DOMPurify.sanitize((document.getElementById("email") as HTMLInputElement).value);
    //creating body
    let body = {email:enteredEmail, password:enteredPassword, nickname:enteredNickname};
    //checking for all fields entered
    if(enteredEmail != "" && enteredPassword != '' && enteredNickname != ''){
      //fetching server
      fetch(`/api/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })
        .then((response) => {
            if (!response.ok) {
              //printing proper error message based on status
              if (response.status === 400) {
                alert('User already exists');
              } else if (response.status === 422) {
                alert("Invalid Email");
              } 
              throw new Error('Not Ok');
            }
            return response.json();
        })
        .then((data) => {
          alert('Account created')
          //link to navigate
          let navigate = data.slice(0,data.indexOf('/',1));
          //saving token
          let token = data.slice((data.indexOf('/', data.indexOf('/') + 1)) + 1)
          //getting html element
          let link = document.getElementById('link');
          let linkpaste = document.getElementById('linkpaste');
          //making visible
          linkpaste?.removeAttribute('hidden');
          //creating html element
          let linkElement = document.createElement('a');
          linkElement.setAttribute("href",navigate);
          linkElement.setAttribute('target', '_blank');
          linkElement.appendChild(document.createTextNode(`http://MySuperheroServer${data}`));
          //adding event
          linkElement.addEventListener('click', function(event){
            verifyEmail(token);
          });
          //appending element
          link?.appendChild(linkElement);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }
  }
}
//creating fuction to verify email
function verifyEmail(token: any){
  //changing window location
  window.location.href = ('/userHome');
  //creating body
  let body = {"verificationToken":token};
  //fetching server
  fetch(`/api/emailVerify`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
    .then((response) => {
        if (!response.ok) {
          throw new Error('Not Ok');
        }
        return response.json();
    })
    .then((data) => {
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

