import React from 'react';
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="mt-12">
        
      <div className="container mx-auto">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-12 px-8 bg-secondary">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">About Us</h2>
            <p className="text-neutral-700 leading-relaxed">
              <strong>Selamat datang, Warga DTETI!</strong>
              <br />
              CapStation merupakan platform untuk mengelola seluruh project Capstone yang diselenggarakan oleh Departemen Teknik Elektro dan Teknologi Informasi (DTETI) UGM.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Contact</h2>
            <div className="space-y-2 text-neutral-700">
              <div className="flex items-start gap-2">
                <svg className="h-5 w-5 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 12 6 12s6-6.75 6-12c0-3.314-2.686-6-6-6z"></path></svg>
                <p>Kompleks Fakultas Teknik UGM, Jl. Grafika No.2, Yogyakarta</p>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8"></path></svg>
                <p>(0274) 552305</p>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 8h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                <p>teti@ugm.ac.id</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-neutral-200 flex flex-col md:flex-row items-center justify-between text-sm text-neutral-600">
          <div>© {new Date().getFullYear()} CapStation — Departemen Teknik Elektro dan Teknologi Informasi, UGM</div>
          <div className="mt-3 md:mt-0">
            <a href="/privacy" className="mr-4 hover:underline">Privacy</a>
            <a href="/terms" className="hover:underline">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}