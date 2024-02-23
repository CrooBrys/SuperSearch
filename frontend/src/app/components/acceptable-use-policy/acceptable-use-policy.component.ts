import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-acceptable-use-policy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './acceptable-use-policy.component.html',
  styleUrl: './acceptable-use-policy.component.css'
})
export class AcceptableUsePolicyComponent implements OnInit{
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
}
