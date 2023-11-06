import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, ParamMap } from "@angular/router";

import { Post } from "../post.model";
import { PostsService } from "../posts.service";
import { mimeType } from "./mime-type.validator";

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.scss']
})
export class PostCreateComponent  implements OnInit {
  enteredTitle: string = '';
  enteredContent: string = '';
  imagePreview: string;
  post: Post;
  isLoading: boolean = false;
  postForm: FormGroup;
  

  private mode = "create";
  private postId: string;
 
  constructor(
    public postsService: PostsService,
    public route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.postForm = new FormGroup({
      title: new FormControl(null, { 
        validators: [Validators.required, Validators.minLength(5)] 
      }),
      content: new FormControl(null, { 
        validators: [Validators.required] 
      }),
      image: new FormControl(null, { 
        validators: [Validators.required], 
        asyncValidators: [mimeType]
      })
    });

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.isLoading = true;
        this.postsService.getPost(this.postId).subscribe(postData => {
          this.isLoading = false;
          this.post = {
            id: postData._id,
            title: postData.title,
            content: postData.content,
            imagePath: postData.imagePath
          };

          this.postForm.setValue({
            title: this.post.title,
            content: this.post.content,
            image: this.post.imagePath
          });
        });
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    });
  }

  onImagePick(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.postForm.patchValue({ image: file });
    this.postForm.get('image').updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = (reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  onSavePost() {
    if (this.postForm.invalid) {
      return;
    };
    
    this.isLoading = true;

    if (this.mode === 'create') {
      this.postsService.addPost(
        this.postForm.value.title, 
        this.postForm.value.content, 
        this.postForm.value.image
      );
    } else {
      this.postsService.updatePost(
        this.postId, 
        this.postForm.value.title, 
        this.postForm.value.content, 
        this.postForm.value.image
      );
    };
    
    this.postForm.reset();
  }
}
