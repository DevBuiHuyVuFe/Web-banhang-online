import React from "react";

interface IconProps {
  className?: string;
  size?: number;
}

// Navigation Icons
export const ChevronDownIcon: React.FC<IconProps> = ({ className = "w-4 h-4", size }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" width={size} height={size}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);
export const ShoppingCartIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" width={size} height={size}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
    </svg>
  );
  
  // Social Media Icons
  export const TwitterIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" width={size} height={size}>
    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
  </svg>
);

export const FacebookIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" width={size} height={size}>
      <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
    </svg>
  );
  
  export const PinterestIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" width={size} height={size}>
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
    </svg>
  );
  
  // Contact Icons
  export const LocationIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" width={size} height={size}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
  
  export const PhoneIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" width={size} height={size}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
  
  export const EmailIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" width={size} height={size}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
  
  // Product Category Icons
  export const FlameIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" width={size} height={size}>
      <path d="M8.852 3.178a.75.75 0 0 1 1.146.64c0 2.232.63 3.423 1.37 4.065.762.66 1.718.867 2.737 1.093 1.222.266 2.49.541 3.58 1.631 1.859 1.859 1.859 4.873 0 6.732a7.5 7.5 0 1 1-12.02-8.82c.876-1.094 1.707-2.379 2.21-4.538a.75.75 0 0 1 .977-.803z"/>
    </svg>
  );
  
  export const NewIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" width={size} height={size}>
      <path d="M12 2.25a.75.75 0 0 1 .75.75v3.19l1.72-1.72a.75.75 0 0 1 1.06 1.06L13.06 8.06a.75.75 0 0 1-1.06 0L8.45 5.56a.75.75 0 1 1 1.06-1.06l1.74 1.74V3a.75.75 0 0 1 .75-.75zM3 12a9 9 0 1 1 18 0 9 9 0 0 1-18 0z"/>
    </svg>
  );
  
  export const StarIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" width={size} height={size}>
      <path d="M11.48 3.5a.75.75 0 0 1 1.04.3l2.04 3.69 4.15.64a.75.75 0 0 1 .41 1.27l-3.03 3.1.72 4.35a.75.75 0 0 1-1.08.79L12 16.96l-3.63 1.88a.75.75 0 0 1-1.08-.79l.72-4.35-3.03-3.1a.75.75 0 0 1 .41-1.27l4.15-.64 2.04-3.69a.75.75 0 0 1 .3-.3z"/>
    </svg>
  );
  
  export const PhoneDeviceIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" width={size} height={size}>
      <path d="M7 2.25A2.25 2.25 0 0 0 4.75 4.5v15A2.25 2.25 0 0 0 7 21.75h10A2.25 2.25 0 0 0 19.25 19.5v-15A2.25 2.25 0 0 0 17 2.25H7zm0 1.5h10a.75.75 0 0 1 .75.75v.75H6.25V4.5a.75.75 0 0 1 .75-.75zM6.25 6.75h11.5v9.5H6.25v-9.5zM12 18.75a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5z"/>
    </svg>
  );
  
  export const LaptopIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" width={size} height={size}>
      <path d="M3.75 6A2.25 2.25 0 0 1 6 3.75h12A2.25 2.25 0 0 1 20.25 6v8.25H3.75V6zM2.25 16.5h19.5a1.5 1.5 0 0 1 0 3H2.25a1.5 1.5 0 0 1 0-3z"/>
    </svg>
  );
  
  export const TabletIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" width={size} height={size}>
      <path d="M6.75 3A2.75 2.75 0 0 0 4 5.75v12.5A2.75 2.75 0 0 0 6.75 21h10.5A2.75 2.75 0 0 0 20 18.25V5.75A2.75 2.75 0 0 0 17.25 3H6.75zm3.5 14.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
    </svg>
  );
  
  export const HeadphoneIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" width={size} height={size}>
      <path d="M12 3.75a8.25 8.25 0 0 0-8.25 8.25v5a3 3 0 0 0 3 3h1.5v-6h-1.5v-2a6.75 6.75 0 0 1 13.5 0v2h-1.5v6H17.25a3 3 0 0 0 3-3v-5A8.25 8.25 0 0 0 12 3.75z"/>
    </svg>
  );
  
  export const PlugIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" width={size} height={size}>
      <path d="M9 2.25a.75.75 0 0 0-1.5 0V6H6a.75.75 0 0 0 0 1.5h1.5v3.879a4.5 4.5 0 0 0 1.318 3.182l1.852 1.852v4.837a.75.75 0 0 0 1.5 0v-4.837l1.852-1.852A4.5 4.5 0 0 0 16.5 11.38V7.5H18a.75.75 0 0 0 0-1.5h-1.5V2.25a.75.75 0 0 0-1.5 0V6h-4V2.25z"/>
    </svg>
  );
  
  export const HomeIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" width={size} height={size}>
      <path d="M12 3.172 3.172 12H6v8.25a.75.75 0 0 0 .75.75h4.5v-6h1.5v6h4.5a.75.75 0 0 0 .75-.75V12h2.828L12 3.172z"/>
    </svg>
  );
  
  // Action Icons
  export const PlusIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" width={size} height={size}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  );
  
  export const MinusIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" width={size} height={size}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
    </svg>
  );
  
  export const TrashIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" width={size} height={size}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
  
  export const EditIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" width={size} height={size}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
  
  export const DeleteIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" width={size} height={size}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
  
  // Status Icons
  export const CheckIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" width={size} height={size}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
  
  export const XIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" width={size} height={size}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
  
  // Empty State Icons
  export const EmptyBoxIcon: React.FC<IconProps> = ({ className = "w-16 h-16", size }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" width={size} height={size}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
  
  export const EmptyCartIcon: React.FC<IconProps> = ({ className = "w-32 h-32", size }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" width={size} height={size}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
    </svg>
  );
  
  export const EmptyOrderIcon: React.FC<IconProps> = ({ className = "mx-auto h-12 w-12", size }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" width={size} height={size}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
  
  // Admin Icons
  export const AdminIcon: React.FC<IconProps> = ({ className = "mx-auto h-12 w-12", size }) => (
    <svg className={className} stroke="currentColor" fill="none" viewBox="0 0 48 48" width={size} height={size}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.566.713-3.714m0 0A9.971 9.971 0 0119 28c2.761 0 5.239 1.143 7.287 3.286M14 28c0-1.313.253-2.566.713-3.714m0 0A9.971 9.971 0 0119 20c2.761 0 5.239 1.143 7.287 3.286M19 20a6 6 0 100-12 6 6 0 000 12z" />
    </svg>
  );
  
  export const ImageIcon: React.FC<IconProps> = ({ className = "mx-auto h-16 w-16", size }) => (
    <svg className={className} stroke="currentColor" fill="none" viewBox="0 0 48 48" width={size} height={size}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" />
    </svg>
  );
  
  // Alert Icons
  export const SuccessIcon: React.FC<IconProps> = ({ className = "h-5 w-5 text-green-400", size }) => (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" width={size} height={size}>
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );
  
  export const ErrorIcon: React.FC<IconProps> = ({ className = "h-5 w-5 text-red-400", size }) => (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" width={size} height={size}>
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  );