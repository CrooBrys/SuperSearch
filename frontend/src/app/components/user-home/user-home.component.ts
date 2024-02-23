import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import DOMPurify from 'dompurify';
@Component({
  selector: 'app-user-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-home.component.html',
  styleUrl: './user-home.component.css'
})
export class UserHomeComponent implements OnInit{
  //on initialization
  ngOnInit(): void {
    //checking token authentication
    fetch(`/api/validate`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({"token": localStorage.getItem('jwt')})
    })
      .then((response) => {
          if (!response.ok) {
            document.getElementById('update')?.setAttribute('hidden','');
            throw new Error('Not Ok');
          }
          return response.json();
      })
      .then((data) => {
        //making navbar items hidden
        (document.getElementById('signup')?.setAttribute('hidden',''));
        (document.getElementById('login')?.setAttribute('hidden',''));
        //checking role
        if (data['role'] === 'admin') {
          //saying admin priviledges available
          document.getElementById('mainbody')?.appendChild(document.createTextNode('SM Priviledges Available'));
          //getting elements
          let elements = document.getElementsByClassName('admin') as HTMLCollectionOf<HTMLElement>;
          //iterating through elements
          for (let i = 0; i < elements.length; i++) {
            //making visible
            elements[i].removeAttribute('hidden');
          }
        }
      })
      .catch((error) => {
          console.error('Error:', error);
      });
  }
  //creating function to disable user
  diableUser() {
    //getting inputs
    let enteredNickname = DOMPurify.sanitize((document.getElementById("disableUserName") as HTMLInputElement).value);
    let enteredPurpose = DOMPurify.sanitize((document.getElementById("disableUserAction") as HTMLInputElement).value);
    //creating body
    let body = {nickname:enteredNickname, purpose:enteredPurpose};
    fetch(`/api/disableAccount`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
      .then((response) => {
          if (!response.ok) {
            alert("No user found");
            throw new Error('Not Ok');
          }
          return response.json();
      })
      .then((data) => {
        alert('User altered');
      })
      .catch((error) => {
          console.error('Error:', error);
      });
  }
  //creating function to grant admin
  grantAdmin() {
    //getting inputs
    let enteredNickname = DOMPurify.sanitize((document.getElementById("grantAdminNickname") as HTMLInputElement).value);
    //creating body
    let body = {nickname:enteredNickname};
    fetch(`/api/grantAdmin`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
      .then((response) => {
          if (!response.ok) {
            alert("No user found");
            throw new Error('Not Ok');
          }
          return response.json();
      })
      .then((data) => {
        alert('Role changed');
      })
      .catch((error) => {
          console.error('Error:', error);
      });
  }
  //clearing results
  clear(){
    //creating variable
    let result = document.getElementById('results');
    //removing children
    while (result?.firstChild) {
        result.removeChild(result.firstChild);
    }
  }
  //creating search function
  search(){
    //clearing page
    this.clear();
    //creating variable
    let result = document.getElementById('results');
    //storing inputs
    let name = DOMPurify.sanitize((document.getElementById('nameInput') as HTMLInputElement).value.trim());
    let race = DOMPurify.sanitize((document.getElementById('raceInput') as HTMLInputElement).value.trim());
    let power = DOMPurify.sanitize((document.getElementById('powerInput') as HTMLInputElement).value.trim());
    let publisher = DOMPurify.sanitize((document.getElementById('publisherInput') as HTMLInputElement).value.trim());
    //setting values to 'noEntryWithinField' string if no value recieved
    if(name === ''){
      name = 'noEntryWithinField'
    }
    if(race === ''){
      race = 'noEntryWithinField'
    }
    if(power === ''){
      power = 'noEntryWithinField'
    }
    if(publisher === ''){
      publisher = 'noEntryWithinField'
    }
    //fetching results from backend
    fetch(`/api/superHeros/${name}/${race}/${power}/${publisher}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Not Ok');
            }
            return response.json();
        })
        .then((data) => {
          //iterating through object
            for(let obj of data){
              //creating element nodes
              let details = document.createElement('details');
              let summary = document.createElement('summary');
              let para = document.createElement('p');
              let button = document.createElement('button');
              //adding button event listener
              button.addEventListener('click', function(){
                window.open('https://duckduckgo.com/?q=' + encodeURIComponent(`${obj['name']}${obj['Publisher']}`));
              });
              //creating string for summary
              let summaryText = `${obj['name']}, ${obj['Publisher']}`;
              //iterating through keys
              for(let key in obj){
                //skipping name and publisher
                if(key != 'name' && key != 'Publisher'){
                  //appending string
                  para.appendChild(document.createTextNode(`${key}:${obj[key]}`));
                  para.appendChild(document.createElement('br'));
                }
              }
              //appending elements 
              summary.appendChild(document.createTextNode(summaryText));
              button.appendChild(document.createTextNode('Search'));
              details.appendChild(summary);
              details.appendChild(para);
              details.appendChild(button);
              result?.appendChild(details);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
  }
}


