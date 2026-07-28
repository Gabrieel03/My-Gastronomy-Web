import toast, { type ToastOptions } from 'react-hot-toast';

const baseOptions: ToastOptions = {
  duration: 4000,
  style: {
    background: '#171717',
    color: '#ffffff',
    border: '1px solid #262626',
    borderRadius: '0.75rem',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
};

export class Toast {
  static success(message: string) {
    return toast.success(message, {
      ...baseOptions,
      iconTheme: {
        primary: '#22c55e',
        secondary: '#171717',
      },
    });
  }

  static error(message: string) {
    return toast.error(message, {
      ...baseOptions,
      iconTheme: {
        primary: '#ef4444',
        secondary: '#171717',
      },
    });
  }

  static loading(message: string) {
    return toast.loading(message, baseOptions);
  }

  static dismiss(toastId?: string) {
    toast.dismiss(toastId);
  }
}