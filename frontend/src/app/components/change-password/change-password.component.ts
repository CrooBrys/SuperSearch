import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import DOMPurify from 'dompurify';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent implements OnInit{
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
            throw new Error('Not Ok');
          }
          return response.json();
      })
      .then((data) => {
        //checking role
        if (data['role'] === 'admin') {
          //saying admin priviledges available
          document.getElementById('mainbody')?.appendChild(document.createTextNode('SM Priviledges Available'));
        }
      })
      .catch((error) => {
          console.error('Error:', error);
      });
  }
  //delaying page refresh due to form
  submitForm(event: Event) {
    if (event) {
      //preventing form submission
      event.preventDefault();
      //setting timeout
      setTimeout(() => {
        //getting form element
        const form = document.getElementById('passwordForm') as HTMLFormElement;
        //triggering submit
        form.submit();
      }, 1000);
    }
  }
  //method to update password
  update() {
    //getting inputs
    let newPassword = DOMPurify.sanitize((document.getElementById("new") as HTMLInputElement).value);
    let currentPassword = DOMPurify.sanitize((document.getElementById("current") as HTMLInputElement).value);
    let nickname = "admin";
    //creating body
    let body = {nickname:nickname, newPassword:newPassword, currentPassword:currentPassword};
    if(currentPassword != "" && newPassword != ''){
      //fetching server
      fetch(`/api/changePassword`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })
        .then((response) => {
            if (!response.ok) {
              alert("Wrong password")
              throw new Error('Not Ok');
            }
            return response.json();
        })
        .then((data) => {
          alert('Password updated')
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }
  }
}
