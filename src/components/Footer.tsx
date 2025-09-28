"use client";

export default function Footer() {
  return (
    <footer className="flex items-center justify-center p-4 text-gray-400 text-sm mt-auto">
      <p>&copy; {new Date().getFullYear()} Developed by Rupesh.</p>
    </footer>
  );
}
