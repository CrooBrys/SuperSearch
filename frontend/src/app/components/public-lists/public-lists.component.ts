import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import DOMPurify from 'dompurify';
@Component({
  selector: 'app-public-lists',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './public-lists.component.html',
  styleUrl: './public-lists.component.css'
})
export class PublicListsComponent implements OnInit{
  //on initialization
  ngOnInit(): void {
    //creating variables
    let result = document.getElementById('publicResults');
    let result2 = document.getElementById('myResults')
    //calling method for public list
    this.returnList(result, 'publicLists');
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
        //getting list action elements
        let elements = document.getElementsByClassName('child') as HTMLCollectionOf<HTMLElement>;
        //iterating through elements
        for (let i = 0; i < elements.length; i++) {
          //making visible
          elements[i].removeAttribute('hidden');
        }
        this.returnList(result2,`myLists/${data['nickname']}`);
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
  //delaying page refresh due to form
  submitForm(event: Event, id: string) {
    if (event) {
      //preventing form submission
      event.preventDefault();
      //setting timeout
      setTimeout(() => {
        //getting form element
        const form = document.getElementById(id) as HTMLFormElement;
        //triggering submit
        form.submit();
      }, 1000);
    }
  }
  //creating hide/show review function
  hideReview() {
    //getting inputs
    let enteredNickname = DOMPurify.sanitize((document.getElementById("hideReviewCreatorNickname") as HTMLInputElement).value);
    let enteredListName = DOMPurify.sanitize((document.getElementById("hideReviewListname") as HTMLInputElement).value);
    let enteredReviewNumber = DOMPurify.sanitize((document.getElementById("hideReviewReviewNumber") as HTMLInputElement).value);
    let enteredPurpose = DOMPurify.sanitize((document.getElementById("hideReviewAction") as HTMLInputElement).value);
    //creating body
    let body = {nickname:enteredNickname, listName:enteredListName, reviewNumber:enteredReviewNumber, purpose:enteredPurpose};
    fetch(`/api/hideReview`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
      .then((response) => {
          if (!response.ok) {
            alert("No review found");
            throw new Error('Not Ok');
          }
          return response.json();
      })
      .then((data) => {
        alert('Review altered');
      })
      .catch((error) => {
          console.error('Error:', error);
      });
    }
  //creating review function
  async review() {
    //getting inputs
    let Enteredname = DOMPurify.sanitize((document.getElementById("reviewName") as HTMLInputElement).value);
    let Reviewrating = DOMPurify.sanitize((document.getElementById("reviewRating") as HTMLInputElement).value);
    let Reviewcomment = DOMPurify.sanitize((document.getElementById("reviewComment") as HTMLInputElement).value);
    let confirm = DOMPurify.sanitize((document.getElementById("confirmReview") as HTMLInputElement).value);
    let nickname;
    //checking required fields
    if (Enteredname !== '' && Reviewrating !== '' && confirm !== '') {
      //checking confirmation
      if (confirm === 'No') {
        alert('Review Stopped');
      } else {
        //checking token authentication
        await fetch(`/api/validate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ "token": localStorage.getItem('jwt') })
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error('Not Ok');
            }
            return response.json();
          })
          .then((data) => {
            //setting nickname
            nickname = data['nickname'];
          })
          .catch((error) => {
            console.error('Error:', error);
          });
        //creating body
        let body = {name:Enteredname, rating:Reviewrating, comment:Reviewcomment, nickname:nickname};
        //fetching server info
        fetch(`/api/review_list`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        })
        .then((response) => {
          if (!response.ok) {
            alert("No public list found");
            throw new Error('Not Ok');
          }
          return response.json();
        })
        .then((data) => {
          alert('Review left');
        })
        .catch((error) => {
          console.error('Error:', error);
        });
      }
    }
  }
  //creating delete function
  async delete() {
    //getting inputs
    let Enteredname = DOMPurify.sanitize((document.getElementById("deleteListName") as HTMLInputElement).value);
    let confirm = DOMPurify.sanitize((document.getElementById('confirm') as HTMLInputElement).value);
    let EnteredcreatorNickname;
    //checking for required fields
    if (Enteredname !== '' && confirm !== '') {
      //checking confirmation
      if (confirm === 'No') {
        alert('Deletion Stopped');
      } else {
        //checking token authentication
        await fetch(`/api/validate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ "token": localStorage.getItem('jwt') })
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error('Not Ok');
            }
            return response.json();
          })
          .then((data) => {
            //setting nickname
            EnteredcreatorNickname = data['nickname'];
          })
          .catch((error) => {
            console.error('Error:', error);
          });
        //creating body
        let body = { name: Enteredname, creatorNickname: EnteredcreatorNickname };
        //fetching server info
        fetch(`/api/delete_list`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        })
          .then((response) => {
            if (!response.ok) {
              alert("No list found owned by you");
              throw new Error('Not Ok');
            }
            return response.json();
          })
          .then((data) => {
            alert('List deleted');
          })
          .catch((error) => {
            console.error('Error:', error);
          });
      }
    }
  }
  //creating edit function
  async edit() {
    //getting inputs
    let Enteredname = DOMPurify.sanitize((document.getElementById("editListName") as HTMLInputElement).value);
    let Enteredsetname = DOMPurify.sanitize((document.getElementById("editListSetName") as HTMLInputElement).value);
    let Enteredheros = DOMPurify.sanitize((document.getElementById("editListSetHeros") as HTMLInputElement).value);
    let Entereddescription = DOMPurify.sanitize((document.getElementById("editListSetDescription") as HTMLInputElement).value);
    let Enteredvisibility = DOMPurify.sanitize((document.getElementById("editListSetVisibility") as HTMLInputElement).value);
    let EnteredcreatorNickname;
    //checking token authentication
    await fetch(`/api/validate`, {
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
        //setting nickname
        EnteredcreatorNickname = data['nickname'];
        
      })
      .catch((error) => {
          console.error('Error:', error);
      });
    //creating body
    let body = {name:Enteredname, setname: Enteredsetname,description:Entereddescription, superHeros: Enteredheros, visibility:Enteredvisibility, creatorNickname:EnteredcreatorNickname};
    //fetching server info
    fetch(`/api/edit_list`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
  })
      .then((response) => {
          if (!response.ok) {
            alert("No list found owned by you or invalid hero entered");
            throw new Error('Not Ok');
          }
          return response.json();
      })
      .then((data) => {
        alert('List updated');
      })
      .catch((error) => {
          console.error('Error:', error);
      });
  }
  //creating create function
  async create() {
    //getting inputs
    let Enteredname = DOMPurify.sanitize((document.getElementById("createListName") as HTMLInputElement).value);
    let Enteredheros = DOMPurify.sanitize((document.getElementById("createListHeros") as HTMLInputElement).value);
    let Entereddescription = DOMPurify.sanitize((document.getElementById("createListDescription") as HTMLInputElement).value);
    let Enteredvisibility = DOMPurify.sanitize((document.getElementById("createListVisibility") as HTMLInputElement).value);
    let EnteredcreatorNickname;
    //checking token authentication
    await fetch(`/api/validate`, {
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
        //setting nickname
        EnteredcreatorNickname = data['nickname'];
        
      })
      .catch((error) => {
          console.error('Error:', error);
      });
    //creating body
    let body = {name:Enteredname, description:Entereddescription, superHeros: Enteredheros, visibility:Enteredvisibility, creatorNickname:EnteredcreatorNickname};
    //checking if required fields are filled
    if(Enteredname != '' && Enteredheros != ''){
      fetch(`/api/create_list`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
        .then((response) => {
            if (!response.ok) {
              alert("List name already exists");
              throw new Error('Not Ok');
                
            }
            return response.json();
        })
        .then((data) => {
          alert('List created');
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }
  }
  //calculating average rating
  rating(array: string | any[]){
    let rating = 0;
    if(array.length === 0){
      return 0;
    }
    else{
      for(let obj of array){
        rating += Number(obj['rating']);
      }
      return(rating/array.length);
    }
  }
  //finding required lists and appending to proper html element
  returnList(result:any, api:any){
    //fetching results from backend
    fetch(`/api/${api}`)
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
            //creating string for summary
            let summaryText = `${obj['name']}, ${obj['creatorNickname']}, ${obj['superHeros'].length}, ${this.rating(obj['rating'])}`;
            //iterating through keys
            for(let key in obj){
              //skipping name and publisher
              if(key != 'name' && key != 'creatorNickname' && key != "lastModified" && key != 'visibility'){
                //if the key is superHero array
                if(key === 'superHeros'){
                  //appending string
                  para.appendChild(document.createTextNode(`superHeros: `));
                  para.appendChild(document.createElement('br'));
                  //iterating through heros
                  for(let hero of obj[key]){
                    //nested fetch for hero info
                    fetch(`/api/superHeros/${hero}/noEntryWithinField/noEntryWithinField/noEntryWithinField`)
                    .then(response => {
                      if (!response.ok) {
                        throw new Error('Not Ok');
                      }
                      return response.json();
                    })
                    .then(data => {
                      //getting first hero
                      let hero = data[0];
                      //creating element nodes
                      let details = document.createElement('details');
                      let summary = document.createElement('summary');
                      let para2 = document.createElement('p');
                      //creating string for summary
                      let summaryText = `${hero['name']}, ${hero['Publisher']}`;
                      //iterating through hero info
                      for(let key in hero){
                        //skipping name
                        if(key != 'name'){
                          //appending string
                          para2.appendChild(document.createTextNode(`${key}:${hero[key]}`));
                          para2.appendChild(document.createElement('br'));
                        }
                      }
                      //appending elements 
                      summary.appendChild(document.createTextNode(summaryText));
                      details.appendChild(summary);
                      details.appendChild(para2);
                      para.appendChild(details);
                    })
                    .catch(error => {
                      console.error('Error:', error);
                    });
                  }
                }
                else{
                  //checking if key is equal to rating
                  if(key === 'rating'){
                    //appending text
                    para.appendChild(document.createTextNode(`rating/comment:`));
                    //iterating through objects of rating
                    for(let obj2 of obj[key]){
                      //checking visibility of rating
                      if(obj2['visibility'] != "false"){
                        //setting count variable
                        let count = 1;
                        //appending text
                        para.appendChild(document.createTextNode(`[`));
                        //iterating through keys of object within rating
                        for(let key in obj2){
                          //checking that visibility is not false
                          if(key != "visibility"){
                            //appending text
                            para.appendChild(document.createTextNode(obj2[key]));
                            //checking if all keys to be displayed are complete
                            if(count < Object.keys(obj2).length - 1){
                              //appending text
                              para.appendChild(document.createTextNode(","));
                            }
                            //incrementing
                            count++;
                          }
                        }
                        //appending text
                        para.appendChild(document.createTextNode("]"));
                      }
                    }
                    //appending element
                    para.appendChild(document.createElement('br'));
                  }
                  else{
                    //appending string
                    para.appendChild(document.createTextNode(`${key}:${obj[key]}`));
                    para.appendChild(document.createElement('br'));
                  }
                }
              }
            }
            //appending elements 
            summary.appendChild(document.createTextNode(summaryText));
            details.appendChild(summary);
            details.appendChild(para);
            result?.appendChild(details);
          }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
  }
}
