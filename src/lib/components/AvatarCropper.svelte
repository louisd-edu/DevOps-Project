<!-- Karanjit Singh: "hab diese File erstellt fürs Cropping bevorn du sauer wirst" -->
<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import Cropper from 'cropperjs';
  import 'cropperjs/dist/cropper.css';

  let img: HTMLImageElement | null = null;
  let cropper: Cropper | null = null;

  export let selectedImage: string | null = null;
  export let aspectRatio: number = 1;

  const dispatch = createEventDispatcher();

  onMount(() => {
    if (!selectedImage) return;

    if (img) {
      if (img.complete) {
        initCropper();
      } else {
        img.addEventListener('load', initCropper, { once: true });
      }
    }
  });

  function initCropper() {
    if (!img) return;
    if (cropper) cropper.destroy();

    cropper = new Cropper(img, {
      aspectRatio,
      viewMode: 1,
      autoCrop: true,
      autoCropArea: 0.8,
      background: false,
      guides: true,
      highlight: true,
      responsive: true,
      movable: true,
      cropBoxResizable: true,
      cropBoxMovable: true,
      dragMode: 'move',
      zoomOnWheel: true
    });
  }

  async function cropImage() {
    if (!cropper) return;

    const canvas = cropper.getCroppedCanvas({
      width: 300,
      height: 300,
      fillColor: '#fff'
    });
    if (!canvas) return;

    const blob: Blob = await new Promise((resolve, reject) =>
      canvas.toBlob(
        (r: Blob | null) => (r ? resolve(r) : reject(new Error('toBlob failed'))),
        'image/jpeg'
      )
    );

    const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
    dispatch('cropped', { file });
  }
</script>

<div class="cropper-container">
  {#if selectedImage}
    <div class="cropper-wrapper">
      <img bind:this={img} src={selectedImage} alt="To crop" class="crop-image" />
    </div>
    <button on:click={cropImage}>Crop & Save</button>
  {/if}
</div>

<style>
  .cropper-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.2rem;
    justify-content: center;
    min-height: 70vh;
  }

  /* Bildgröße begrenzen */
  .cropper-wrapper {
    width: 450px;
    max-width: 90vw;
    border-radius: 8px;
    overflow: hidden;
  }

  .crop-image {
    max-width: 100%;
    display: block;
  }

  button {
    background: #2563eb;
    color: white;
    border: none;
    padding: 0.7rem 1.4rem;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    transition: background 0.2s ease;
  }

  button:hover {
    background: #1e4ed8;
  }
</style>
