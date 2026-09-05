'use client';

export default function DeleteButton({ id }: { id: string }) {
  return (
    <button 
      type="button" 
      className="border-0 bg-transparent p-0 confirm-text"
      onClick={(e) => {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        const Swal = (window as any).Swal;
        
        if (Swal) {
          Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
            confirmButtonClass: "btn btn-primary",
            cancelButtonClass: "btn btn-danger ml-1",
            buttonsStyling: false
          }).then((t: any) => {
            if (t.value) {
              const $ = (window as any).$;
              // Animate row removal visually
              const tr = $(form).closest('tr');
              if (tr.length > 0) {
                tr.fadeOut(400); 
              }
              // Submit the server action form
              if (form) form.requestSubmit();
              
              Swal.fire({ 
                type: "success", 
                title: "Deleted!", 
                text: "Your item has been deleted.", 
                confirmButtonClass: "btn btn-success" 
              });
            }
          });
        } else {
          // Fallback just in case SweetAlert hasn't loaded
          if (window.confirm('Are you sure you want to delete this item?')) {
            if (form) form.requestSubmit();
          }
        }
      }}
    >
      <img src="/assets/img/icons/delete.svg" alt="img" />
    </button>
  );
}
