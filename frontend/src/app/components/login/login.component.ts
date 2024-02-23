import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import DOMPurify from 'dompurify';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  //delaying page refresh due to form
  submitForm(event: Event) {
    if (event) {
      //preventing form submission
      event.preventDefault();
    }
  }
  //creating function to login
  login(){
    //getting inputs
    let enteredEmail = DOMPurify.sanitize((document.getElementById("email") as HTMLInputElement).value);
    let enteredPassword = DOMPurify.sanitize((document.getElementById("password") as HTMLInputElement).value);
    //creating body
    let body = {email:enteredEmail, password:enteredPassword};
    if(enteredEmail != "" && enteredPassword != ''){
      //fetching server
      fetch(`/api/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })
        .then(async (response) => {
            if (!response.ok) {
              //printing proper error message based on status
              if (response.status === 404) {
                alert('Invalid credentials');
              } else if (response.status === 428) {
                  let text = JSON.parse(await response.text());
                  //link to navigate
                  let navigate = text.slice(0,text.indexOf('/',1));
                  //saving token
                  let token = text.slice((text.indexOf('/', text.indexOf('/') + 1)) + 1)
                  console.log(token)
                  //getting html element
                  let link = document.getElementById('link');
                  let linkpaste = document.getElementById('linkpaste');
                  //making visible
                  linkpaste?.removeAttribute('hidden');
                  //creating html element
                  let linkElement = document.createElement('a');
                  linkElement.setAttribute("href",navigate);
                  linkElement.setAttribute('target', '_blank');
                  linkElement.appendChild(document.createTextNode(`http://MySuperheroServer${text}`));
                  //adding event
                  linkElement.addEventListener('click', function(event){
                    verifyEmail(token);
                  });
                  //appending element
                  link?.appendChild(linkElement);
              } else if (response.status === 403) {
                alert('Account disabled, please contact site administrator');
              } else if (response.status === 401) {
                alert('Invalid password');
              }
              throw new Error('Not Ok');
            }
            return response.json();
        })
        .then((text) => {
          //setting jwt to local storage
          localStorage.setItem("jwt", text);
          //changing window location
          window.location.href = ('/userHome');
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
    .then((text) => {
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}
