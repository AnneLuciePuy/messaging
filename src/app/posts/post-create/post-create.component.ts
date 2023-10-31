import { Component, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";

import { PostsService } from "../posts.service";


@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.scss']
})
export class PostCreateComponent  {
  enteredTitle: string = '';
  enteredContent: string = '';

  constructor(
    public postsService: PostsService
  ) { }

  onAddPost(postForm: NgForm) {
    if (postForm.invalid) {
      return;
    };
  
    this.postsService.addPost(postForm.value.title, postForm.value.content);
    postForm.resetForm();
  }
}
