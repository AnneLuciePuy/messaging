import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { Subscription } from "rxjs";

import { Post } from "../post.model";
import { PostsService } from "../posts.service";
import { mimeType } from "./mime-type.validator";
import { AuthService } from "src/app/auth/auth.service";

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.scss']
})
export class PostCreateComponent  implements OnInit, OnDestroy {
  public enteredTitle: string = '';
  public enteredContent: string = '';
  public imagePreview: string;
  public post: Post;
  public isLoading: boolean = false;
  public postForm: FormGroup;
  public mode = "create";

  private postId: string;
  private authStatusSub: Subscription;
 
  constructor(
    public postsService: PostsService,
    public route: ActivatedRoute,
    public authService: AuthService
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
            imagePath: postData.imagePath,
            creator: postData.creator
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

    this.authStatusSub = this.authService.getAuthStatusLister().subscribe({
      next: (authStatus) => {
        this.isLoading = false;
      }
    });
  }

  /* public onImagePick(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.postForm.patchValue({ image: file });
    this.postForm.get('image').updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = (reader.result as string);
    };
    reader.readAsDataURL(file);
  } */

  public onImagePick(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.src = e.target.result;

        img.onload = () => {
          // Redimensionner l'image
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const maxWidth = 800;
          const maxHeight = 800;

          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          ctx.drawImage(img, 0, 0, width, height);

          // Convertir le canevas en base64
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

          // Mettre à jour le formulaire et l'aperçu de l'image
          this.postForm.patchValue({ image: this.dataURItoBlob(dataUrl) });
          this.postForm.get('image').updateValueAndValidity();
          this.imagePreview = dataUrl;
        };
      };

      reader.readAsDataURL(file);
    }
  }

  private dataURItoBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: 'image/jpeg' });
  }

  public onSavePost() {
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

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
