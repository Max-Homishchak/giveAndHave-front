import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Task } from '../models/task';
import { Transaction } from '../models/transaction';
import { User } from '../models/user';
import { TaskService } from '../services/task.service';
import { TransactionService } from '../services/transaction.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  currentUser: User;
  balance: number;
  profileDisabled: boolean = true;

  showModal: boolean = false;

  transactions: Transaction[];
  freelancers: User[];
  actions = ['Post Task', 'Take Task'];

  constructor(private router: Router,
    private userService: UserService,
    private transactionService: TransactionService,
    private taskService: TaskService) { }

  ngOnInit(): void {

    this.getCurrentUser();

    this.getFreelancers();
    
    this.getAllTrnsactions();
  }

  performAction(action: any) {

    const container = document.getElementById('mainContainer');

    const button = document.createElement('button');
    button.type = 'button';
    button.style.display = 'none';
    button.setAttribute('data-bs-toggle', 'modal');

    if(action === 'Post Task') {
      button.setAttribute('data-bs-target', '#postTaskModal');
    } else if(action == 'Take Task') {
      this.router.navigate(['/tasks']);
    } else if(action == 'Profile') {
      button.setAttribute('data-bs-target', '#profileModal');
    }

    container?.appendChild(button);
    button.click();
  }


  onPostTask(postForm: NgForm){
    document.getElementById('post-task-form')?.click();

    let task: Task = postForm.value;
    task.taskActive = true;

    this.taskService.postTask(task, this.currentUser.id).subscribe(
      res => {
        this.openCreatedTaskModal();
      }
    );

    postForm.reset();
  }

  onUpdateProfile(updateProfileForm: NgForm) {
  }

  makeProfileChangeable() {
    this.profileDisabled = !this.profileDisabled;
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']); 
  }

  private getCurrentUser() {
    this.userService.getUser().subscribe(data => {
      this.currentUser = data;
      this.balance = this.currentUser.balance;
    })
  }

  private getFreelancers() {
    this.userService.getFreelancers().subscribe(data => {
      this.freelancers = data;
    })
  }

  private getAllTrnsactions() {
    this.transactionService.getTransactions().subscribe(data => {
      this.transactions = data;
      this.transactions.forEach((transaction) => {
        this.attachUsersToTransaction(transaction)});
    })
  }

  private attachUsersToTransaction(transaction: Transaction) {
    this.userService.getPairInTransaction(transaction.id).subscribe(
      data => {
        let users: User[] = data;
        transaction.sender = users[0];
        transaction.receiver = users[1];
      }
    );

    return transaction;
  }

  private openCreatedTaskModal() {
    const container = document.getElementById('createTask');

    const button = document.createElement('button');
    button.type = 'button';
    button.style.display = 'none';
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#createTask');

    container?.appendChild(button);
    button.click();
  }
}
