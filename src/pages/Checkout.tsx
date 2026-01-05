import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartService } from '../assets/api/cartService';
import { AuthService } from '../assets/api/authService';
import { OrderService } from '../assets/api/orderService';
import { PaymentService } from '../assets/api/paymentService';
import { AddressService } from '../assets/api/addressService';
import type { CartItem } from '../assets/api/types';
import { UserIcon, VoucherIcon, MoneyIcon, SearchIcon, ListIcon, CelebrationIcon, WarningIcon, TargetIcon, BoxIcon, SettingsIcon, CheckIcon, XIcon, RocketIcon } from '../components/Icons';

declare global {
  interface Window {
    google: any;
  }
}

type PlaceOption = { code: number; name: string };

function normalizePlace(s: string) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripPlacePrefix(name: string) {
  const s = String(name || '').trim();
  // Tỉnh/Thành phố
  if (s.startsWith('Thành phố ')) return s.slice('Thành phố '.length).trim();
  if (s.startsWith('Tỉnh ')) return s.slice('Tỉnh '.length).trim();
  // Quận/Huyện/Thị xã/Thành phố thuộc tỉnh
  if (s.startsWith('Quận ')) return s.slice('Quận '.length).trim();
  if (s.startsWith('Huyện ')) return s.slice('Huyện '.length).trim();
  if (s.startsWith('Thị xã ')) return s.slice('Thị xã '.length).trim();
  if (s.startsWith('Thành phố ')) return s.slice('Thành phố '.length).trim();
  // Phường/Xã/Thị trấn
  if (s.startsWith('Phường ')) return s.slice('Phường '.length).trim();
  if (s.startsWith('Xã ')) return s.slice('Xã '.length).trim();
  if (s.startsWith('Thị trấn ')) return s.slice('Thị trấn '.length).trim();
  return s;
}

function findPlaceByName(list: PlaceOption[], name: string) {
  const target = normalizePlace(name);
  if (!target) return null;
  return (
    list.find((x) => normalizePlace(x.name) === target) ||
    list.find((x) => normalizePlace(stripPlacePrefix(x.name)) === target) ||
    null
  );
}

interface CheckoutForm {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  paymentMethod: string;
  note: string;
}

interface CartItemWithDetails extends CartItem {
  variant_sku?: string;
  color?: string;
  size?: string;
  variant_price?: number;
  product_name?: string;
  product_img?: string;
  product_img_alt?: string;
  product_img_title?: string;
}

interface Voucher {
  id: number;
  code: string;
  name: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount: number;
  valid_from: string;
  valid_until: string;
}

interface UserVoucher {
  id: number;
  assigned_at: string;
  is_used: boolean;
  used_at: string | null;
  voucher: Voucher;
}

const Checkout: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItemWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userVouchers, setUserVouchers] = useState<UserVoucher[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<UserVoucher | null>(null);
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  // Gợi ý địa điểm (VN): Tỉnh/TP -> Quận/Huyện -> Phường/Xã
  const [provinces, setProvinces] = useState<PlaceOption[]>([]);
  const [districts, setDistricts] = useState<PlaceOption[]>([]);
  const [wards, setWards] = useState<PlaceOption[]>([]);
  const [provinceCode, setProvinceCode] = useState<number | null>(null);
  const [districtCode, setDistrictCode] = useState<number | null>(null);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [form, setForm] = useState<CheckoutForm>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    paymentMethod: 'cod',
    note: ''
  });

  const navigate = useNavigate();

  // Load danh sách Tỉnh/Thành phố để gợi ý
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setPlacesLoading(true);
        const res = await fetch('https://provinces.open-api.vn/api/p/');
        const data = await res.json();
        const list: PlaceOption[] = Array.isArray(data)
          ? data
              .filter((x: any) => x && typeof x.code === 'number' && typeof x.name === 'string')
              .map((x: any) => ({ code: x.code, name: x.name }))
          : [];
        if (!cancelled) setProvinces(list);
      } catch (e) {
        console.log('Load provinces failed (ignore):', e);
      } finally {
        if (!cancelled) setPlacesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Nếu user đã có city (từ địa chỉ mặc định), map sang provinceCode để load district gợi ý
  useEffect(() => {
    if (!provinces.length) return;
    if (provinceCode) return;
    if (!form.city) return;
    const match = findPlaceByName(provinces, form.city);
    if (match) setProvinceCode(match.code);
  }, [provinces, form.city, provinceCode]);

  // Load Quận/Huyện theo provinceCode
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!provinceCode) {
        setDistricts([]);
        setDistrictCode(null);
        setWards([]);
        return;
      }
      try {
        setPlacesLoading(true);
        const res = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
        const data = await res.json();
        const list: PlaceOption[] = Array.isArray(data?.districts)
          ? data.districts
              .filter((x: any) => x && typeof x.code === 'number' && typeof x.name === 'string')
              .map((x: any) => ({ code: x.code, name: x.name }))
          : [];
        if (cancelled) return;
        setDistricts(list);
        setWards([]);

        // Nếu đã có district text, map sang districtCode để load ward gợi ý
        const matchDistrict = findPlaceByName(list, form.district);
        if (matchDistrict) setDistrictCode(matchDistrict.code);
      } catch (e) {
        console.log('Load districts failed (ignore):', e);
      } finally {
        if (!cancelled) setPlacesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [provinceCode, form.district]);

  // Load Phường/Xã theo districtCode
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!districtCode) {
        setWards([]);
        return;
      }
      try {
        setPlacesLoading(true);
        const res = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
        const data = await res.json();
        const list: PlaceOption[] = Array.isArray(data?.wards)
          ? data.wards
              .filter((x: any) => x && typeof x.code === 'number' && typeof x.name === 'string')
              .map((x: any) => ({ code: x.code, name: x.name }))
          : [];
        if (cancelled) return;
        setWards(list);
      } catch (e) {
        console.log('Load wards failed (ignore):', e);
      } finally {
        if (!cancelled) setPlacesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [districtCode]);

  // Khởi tạo Google Places Autocomplete cho trường địa chỉ
  useEffect(() => {
    if (!addressInputRef.current || !window.google) return;

    const input = addressInputRef.current;

    // Tạo Autocomplete với giới hạn kết quả cho Việt Nam
    const autocomplete = new window.google.maps.places.Autocomplete(
      input,
      {
        componentRestrictions: { country: 'vn' },
        fields: ['address_components', 'formatted_address', 'place_id'],
        types: ['address']
      }
    );

    autocompleteRef.current = autocomplete;

    // Xử lý khi chọn địa chỉ từ danh sách gợi ý
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      
      // Chỉ xử lý nếu có place_id (nghĩa là đã chọn một địa chỉ hợp lệ từ danh sách)
      if (!place.place_id || !place.address_components) {
        return;
      }

      let streetNumber = '';
      let route = '';
      let ward = '';
      let district = '';
      let city = '';

      // Parse address components
      place.address_components.forEach((component: any) => {
        const types = component.types;

        if (types.includes('street_number')) {
          streetNumber = component.long_name;
        }
        if (types.includes('route')) {
          route = component.long_name;
        }
        if (types.includes('sublocality_level_1') || types.includes('ward')) {
          ward = component.long_name;
        }
        if (types.includes('sublocality_level_2') || types.includes('administrative_area_level_3')) {
          if (!ward) {
            ward = component.long_name;
          }
        }
        if (types.includes('administrative_area_level_2') || types.includes('district')) {
          district = component.long_name;
        }
        if (types.includes('administrative_area_level_1') || types.includes('province')) {
          city = component.long_name;
        }
      });

      // Tạo địa chỉ đầy đủ
      const fullAddress = [streetNumber, route].filter(Boolean).join(' ') || place.formatted_address;

      // Cập nhật form - chỉ điền các trường còn trống, không override nếu đã có giá trị
      setForm(prev => ({
        ...prev,
        address: fullAddress,
        ward: prev.ward || ward,
        district: prev.district || district,
        city: prev.city || city
      }));

      // Nếu có city, tìm và set provinceCode để load districts
      if (city && provinces.length > 0) {
        const match = findPlaceByName(provinces, city);
        if (match) {
          setProvinceCode(match.code);
        }
      }

      // Nếu có district, tìm và set districtCode để load wards
      if (district && districts.length > 0) {
        const match = findPlaceByName(districts, district);
        if (match) {
          setDistrictCode(match.code);
        }
      }
    });

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [provinces, districts]);

  useEffect(() => {
    loadCart();
    
    // Auto-fill thông tin nếu user đã đăng nhập
    const currentUser = AuthService.getUser();
    if (currentUser?.id) {
      setForm(prev => ({
        ...prev,
        fullName: currentUser.full_name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || prev.phone || ''
      }));
      // Load voucher từ API nếu user đã đăng nhập
      console.log('User logged in, calling loadUserVouchers...');
      loadUserVouchers();

      // Load địa chỉ mặc định nếu có
      (async () => {
        try {
          const addr = await AddressService.getDefaultAddress(currentUser.id);
          if (!addr) return;
          setForm(prev => ({
            ...prev,
            phone: prev.phone || addr.phone || currentUser.phone || '',
            address: prev.address || addr.line1 || '',
            ward: prev.ward || (addr.ward || ''),
            district: prev.district || (addr.district || ''),
            city: prev.city || (addr.city || ''),
          }));
        } catch (e) {
          console.log('Load default address failed (ignore):', e);
        }
      })();
    } else {
      // Tạo voucher mẫu để test giao diện nếu user chưa đăng nhập
      console.log('User not logged in, creating sample vouchers for UI testing...');
      createSampleVouchers();
    }
  }, []);

  // Thêm useEffect để theo dõi thay đổi user
  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (currentUser?.id && userVouchers.length === 0) {
      console.log('User detected, loading vouchers...');
      loadUserVouchers();
    }
  }, [userVouchers.length]);

  // Thêm useEffect để tự động load voucher khi user đăng nhập
  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (currentUser?.id) {
      console.log('User login detected, loading vouchers...');
      loadUserVouchers();
    }
  }, []);

  const loadCart = async () => {
    try {
      const cart = await CartService.getCart();
      if (cart.items.length === 0) {
        navigate('/cart');
        return;
      }
      
      // Cart API đã trả về thông tin chi tiết về variant và product
      // Không cần gọi API riêng lẻ nữa
      setCartItems(cart.items);
    } catch (e: any) {
      console.error('Load cart error:', e);
      navigate('/cart');
    } finally {
      setLoading(false);
    }
  };

  const loadUserVouchers = async () => {
    const currentUser = AuthService.getUser();
    
    try {
      setVoucherLoading(true);
      
      if (currentUser?.id) {
        console.log('User logged in, trying to load assigned vouchers...', currentUser.id);
        
        // Thử load voucher đã được gán cho user
        const response = await fetch(`http://localhost:3000/api/user-vouchers/${currentUser.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        console.log('User vouchers API response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('User vouchers API response:', data);
          
          const validVouchers = (data.data || []).filter((uv: any) => 
            uv && uv.voucher && 
            typeof uv.voucher.code === 'string' &&
            typeof uv.voucher.name === 'string'
          );
          
          console.log('Valid assigned vouchers:', validVouchers);
          
          if (validVouchers.length > 0) {
            setUserVouchers(validVouchers);
            console.log('Successfully loaded assigned vouchers from API');
            return;
          }
        }
        
        // Nếu không có voucher được gán, thử load tất cả voucher có sẵn
        console.log('No assigned vouchers, trying to load all available vouchers...');
        await loadAllAvailableVouchers();
        
      } else {
        // User chưa đăng nhập, load tất cả voucher có sẵn
        console.log('User not logged in, loading all available vouchers...');
        await loadAllAvailableVouchers();
      }
    } catch (error) {
      console.error('Error loading vouchers:', error);
      // Fallback về voucher mẫu
      console.log('Creating sample vouchers due to error...');
      createSampleVouchers();
    } finally {
      setVoucherLoading(false);
    }
  };

  // Load tất cả voucher có sẵn từ admin
  const loadAllAvailableVouchers = async () => {
    try {
      console.log('Loading all available vouchers...');
      const response = await fetch('http://localhost:3000/api/vouchers/available', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('All vouchers API response:', data);
        
        const availableVouchers = (data.data || []).filter((v: any) => 
          v && v.is_active && 
          new Date() >= new Date(v.valid_from) && 
          new Date() <= new Date(v.valid_until)
        ).map((voucher: any) => ({
          id: Math.random(), // Tạo ID tạm thời
          assigned_at: new Date().toISOString(),
          is_used: false,
          used_at: null,
          voucher: voucher
        }));
        
        console.log('Available vouchers:', availableVouchers);
        
        if (availableVouchers.length > 0) {
          setUserVouchers(availableVouchers);
          console.log('Successfully loaded all available vouchers');
        } else {
          console.log('No available vouchers found, creating sample vouchers...');
          createSampleVouchers();
        }
      } else {
        console.error('Failed to load all vouchers:', response.status);
        createSampleVouchers();
      }
    } catch (error) {
      console.error('Error loading all vouchers:', error);
      createSampleVouchers();
    }
  };

  // Tạo voucher mẫu để test
  const createSampleVouchers = () => {
    console.log('Creating sample vouchers...');
    const sampleVouchers = [
      {
        id: 1,
        assigned_at: new Date().toISOString(),
        is_used: false,
        used_at: null,
        voucher: {
          id: 1,
          code: 'SALE20',
          name: 'Giảm giá 20%',
          description: 'Giảm giá 20% cho đơn hàng từ 500k',
          discount_type: 'percentage' as 'percentage' | 'fixed',
          discount_value: 20,
          min_order_amount: 500000,
          max_discount: 200000,
          valid_from: '2024-01-01T00:00:00',
          valid_until: '2024-12-31T23:59:59'
        }
      },
      {
        id: 2,
        assigned_at: new Date().toISOString(),
        is_used: false,
        used_at: null,
        voucher: {
          id: 2,
          code: 'FREESHIP',
          name: 'Miễn phí vận chuyển',
          description: 'Miễn phí vận chuyển cho đơn hàng từ 1 triệu',
          discount_type: 'fixed' as 'percentage' | 'fixed',
          discount_value: 50000,
          min_order_amount: 1000000,
          max_discount: 50000,
          valid_from: '2024-01-01T00:00:00',
          valid_until: '2024-06-30T23:59:59'
        }
      },
      {
        id: 3,
        assigned_at: new Date().toISOString(),
        is_used: false,
        used_at: null,
        voucher: {
          id: 3,
          code: 'NEWUSER',
          name: 'Giảm giá cho khách mới',
          description: 'Giảm giá 15% cho khách hàng mới',
          discount_type: 'percentage' as 'percentage' | 'fixed',
          discount_value: 15,
          min_order_amount: 200000,
          max_discount: 100000,
          valid_from: '2024-01-01T00:00:00',
          valid_until: '2024-12-31T23:59:59'
        }
      }
    ];
    
    console.log('Setting sample vouchers:', sampleVouchers);
    setUserVouchers(sampleVouchers);
    setVoucherLoading(false); // Đảm bảo loading state được reset
  };

  const handleVoucherCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVoucherCode(e.target.value);
  };

  const applyVoucherByCode = () => {
    if (!voucherCode.trim()) return;

    const voucher = userVouchers.find(uv => 
      uv.voucher && uv.voucher.code.toLowerCase() === voucherCode.toLowerCase() && 
      !uv.is_used
    );

    if (voucher) {
      setSelectedVoucher(voucher);
      setVoucherCode('');
      // Hiển thị thông báo thành công
      const discount = getVoucherDiscount();
      alert(`Áp dụng voucher thành công!\n\n${voucher.voucher.name}\nTiết kiệm: ${formatCurrency(discount)}`);
    } else {
      alert('Mã voucher không hợp lệ hoặc đã được sử dụng');
    }
  };

  const removeVoucher = () => {
    if (selectedVoucher) {
      const voucherName = selectedVoucher.voucher?.name || 'Voucher';
      if (confirm(`Bạn có chắc muốn bỏ chọn ${voucherName}?`)) {
        setSelectedVoucher(null);
        alert('Đã bỏ chọn voucher');
      }
    }
  };

  const getVoucherDiscount = () => {
    if (!selectedVoucher || !selectedVoucher.voucher) return 0;
    
    const subtotal = CartService.calculateTotal(cartItems);
    const { voucher } = selectedVoucher;
    
    if (subtotal < voucher.min_order_amount) return 0;
    
    let discount = 0;
    if (voucher.discount_type === 'percentage') {
      discount = (subtotal * voucher.discount_value) / 100;
      if (voucher.max_discount > 0) {
        discount = Math.min(discount, voucher.max_discount);
      }
    } else {
      discount = voucher.discount_value;
    }
    
    return discount;
  };

  const handleInputChange = (field: keyof CheckoutForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // OnChange wrappers để map text -> code (để load gợi ý cấp tiếp theo)
  const handleCityChange = (value: string) => {
    handleInputChange('city', value);
    const match = findPlaceByName(provinces, value);
    if (match) {
      setProvinceCode(match.code);
      // reset cấp dưới nếu đổi tỉnh
      if (form.district) handleInputChange('district', '');
      if (form.ward) handleInputChange('ward', '');
      setDistrictCode(null);
    }
  };

  const handleDistrictChange = (value: string) => {
    handleInputChange('district', value);
    const match = findPlaceByName(districts, value);
    if (match) {
      setDistrictCode(match.code);
      if (form.ward) handleInputChange('ward', '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.phone || !form.address || !form.city || !form.district) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setSubmitting(true);
    try {
      // Lấy user_id từ AuthService nếu user đã đăng nhập
      const currentUser = AuthService.getUser();
      const userId = currentUser?.id || null;
      
      // Tạo dữ liệu đơn hàng
      const orderData = {
        user_id: userId, // Sử dụng user_id thực tế
        shipping_address: {
          full_name: form.fullName,
          email: form.email,
          phone: form.phone,
          address: form.address,
          city: form.city,
          district: form.district,
          ward: form.ward
        },
        payment_method: form.paymentMethod,
        note: form.note,
        items: cartItems.map(item => ({
          variant_id: item.variant_id,
          product_id: null, // Để API tự động lấy từ variant_id
          quantity: item.quantity,
          unit_price: item.unit_price,
          name_snapshot: `Sản phẩm #${item.variant_id}`, // Tạo tên mặc định
          sku_snapshot: `SKU-${item.variant_id}` // Tạo SKU mặc định
        })),
        subtotal: CartService.calculateTotal(cartItems),
        discount: getVoucherDiscount(),
        shipping_fee: calculateShippingFee(),
        tax: calculateTax(),
        total: calculateFinalTotal()
      };
      
      console.log('Order data:', orderData);
      console.log('User ID:', userId);
      
      // Gọi API tạo đơn hàng thực tế
      const response = await OrderService.createOrder(orderData);
      
      if (response.success) {
        // Lưu địa chỉ cho lần sau (chỉ khi user đã đăng nhập)
        if (saveAddress && currentUser?.id) {
          try {
            await AddressService.saveDefaultAddress(currentUser.id, {
              full_name: form.fullName,
              phone: form.phone,
              line1: form.address,
              ward: form.ward || null,
              district: form.district || null,
              city: form.city || null,
            });
          } catch (e) {
            console.log('Save address failed (ignore):', e);
          }
        }

        // Nếu chọn MoMo: tạo giao dịch và redirect sang payUrl
        if (form.paymentMethod === 'momo') {
          const momo = await PaymentService.createMomoPayment(response.order.id);
          const payUrl = momo?.payUrl;
          if (!payUrl) {
            alert('Không thể tạo thanh toán MoMo. Vui lòng thử lại.');
            return;
          }
          // Không clear cart ngay để tránh mất giỏ nếu user hủy thanh toán.
          window.location.assign(payUrl);
          return;
        }

        alert(`Đặt hàng thành công! Mã đơn hàng: ${response.order.code}`);

        // Xóa giỏ hàng (COD/Bank transfer)
        await CartService.clearCart();

        // Chuyển đến trang profile để xem đơn hàng
        navigate('/profile');
      } else {
        throw new Error('Tạo đơn hàng thất bại');
      }
      
    } catch (e: any) {
      console.error('Đặt hàng thất bại:', e);
      alert('Đặt hàng thất bại: ' + (e.message || 'Lỗi không xác định'));
    } finally {
      setSubmitting(false);
    }
  };

  const calculateShippingFee = () => {
    // Logic tính phí vận chuyển dựa trên địa chỉ
    const total = CartService.calculateTotal(cartItems);
    if (total > 500000) return 0; // Miễn phí vận chuyển cho đơn hàng > 500k
    return 30000; // Phí vận chuyển cố định 30k
  };

  const calculateTax = () => {
    // Thuế VAT 10%
    const subtotal = CartService.calculateTotal(cartItems);
    const discount = getVoucherDiscount();
    const taxableAmount = subtotal - discount;
    return Math.round(taxableAmount * 0.1);
  };

  const calculateFinalTotal = () => {
    const subtotal = CartService.calculateTotal(cartItems);
    const discount = getVoucherDiscount();
    const shippingFee = calculateShippingFee();
    const tax = calculateTax();
    return subtotal - discount + shippingFee + tax;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const totalAmount = CartService.calculateTotal(cartItems);
  const voucherDiscount = getVoucherDiscount();
  const shippingFee = calculateShippingFee();
  const tax = calculateTax();
  const finalTotal = calculateFinalTotal();

  if (loading) return <div className="max-w-7xl mx-auto p-4">Đang tải...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Thanh toán</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form thông tin giao hàng */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Thông tin giao hàng</h2>
            
            {/* Thông báo user đang đặt hàng */}
            {AuthService.getUser()?.id && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center text-blue-800">
                  <UserIcon className="mr-2 w-5 h-5" />
                  <span className="text-sm">
                    Đang đặt hàng với tài khoản: <strong>{AuthService.getUser()?.email}</strong>
                  </span>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    disabled={!!AuthService.getUser()?.id}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      AuthService.getUser()?.id ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Nhập họ và tên"
                  />
                  {AuthService.getUser()?.id && (
                    <p className="text-xs text-gray-500 mt-1">Thông tin được lấy từ tài khoản của bạn</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!!AuthService.getUser()?.id}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      AuthService.getUser()?.id ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="example@email.com"
                  />
                  {AuthService.getUser()?.id && (
                    <p className="text-xs text-gray-500 mt-1">Thông tin được lấy từ tài khoản của bạn</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0123456789"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tỉnh/Thành phố <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Thành phố Hà Nội"
                    list="provinceList"
                  />
                  <datalist id="provinceList">
                    {provinces.map((p) => (
                      <option key={p.code} value={stripPlacePrefix(p.name)} />
                    ))}
                  </datalist>
                  <p className="text-xs text-gray-500 mt-1">
                    {placesLoading
                      ? 'Đang tải gợi ý địa điểm...'
                      : ''}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Quận/Huyện <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.district}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Quận Ba Đình"
                    list="districtList"
                    disabled={!provinceCode}
                  />
                  <datalist id="districtList">
                    {districts.map((d) => (
                      <option key={d.code} value={stripPlacePrefix(d.name)} />
                    ))}
                  </datalist>
                  {!provinceCode && (
                    <p className="text-xs text-gray-500 mt-1">
                      {/* Vui lòng chọn Tỉnh/Thành phố trước */}
                    </p>
                  )}
                  {provinceCode && districts.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Chọn từ gợi ý để tự động load Phường/Xã
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phường/Xã
                  </label>
                  <input
                    type="text"
                    value={form.ward}
                    onChange={(e) => handleInputChange('ward', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder={districtCode ? "Phường 1" : "Chọn Quận/Huyện trước"}
                    list={districtCode ? "wardList" : undefined}
                    disabled={!districtCode}
                  />
                  {districtCode && (
                    <datalist id="wardList">
                      {wards.length > 0 ? (
                        <>
                          {wards.map((w) => (
                            <option key={w.code} value={w.name} />
                          ))}
                          {wards.map((w) => {
                            const stripped = stripPlacePrefix(w.name);
                            return stripped !== w.name ? (
                              <option key={`${w.code}-stripped`} value={stripped} />
                            ) : null;
                          })}
                        </>
                      ) : (
                        <option value="Đang tải..." disabled />
                      )}
                    </datalist>
                  )}
                  {!districtCode && (
                    <p className="text-xs text-gray-500 mt-1">
                      {/* Vui lòng chọn Quận/Huyện trước */}
                    </p>
                  )}
                  {districtCode && placesLoading && (
                    <p className="text-xs text-blue-500 mt-1">
                      Đang tải danh sách Phường/Xã...
                    </p>
                  )}
                  {districtCode && !placesLoading && wards.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Có {wards.length} gợi ý - Gõ để xem danh sách
                    </p>
                  )}
                  {districtCode && !placesLoading && wards.length === 0 && (
                    <p className="text-xs text-orange-500 mt-1">
                      Không tìm thấy Phường/Xã cho Quận/Huyện này
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Địa chỉ <span className="text-red-500">*</span>
                </label>
                <input
                  ref={addressInputRef}
                  type="text"
                  required
                  value={form.address}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập địa chỉ để xem gợi ý từ Google..."
                  id="address-input"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {/* Sử dụng gợi ý từ Google Maps - Tự động điền Tỉnh/Thành phố, Quận/Huyện, Phường/Xã */}
                </p>
              </div>

              

              <div>
                <label className="block text-sm font-medium mb-1">
                  Phương thức thanh toán <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={form.paymentMethod === 'cod'}
                      onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                      className="mr-2"
                    />
                    <span>Thanh toán khi nhận hàng (COD)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank_transfer"
                      checked={form.paymentMethod === 'bank_transfer'}
                      onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                      className="mr-2"
                    />
                    <span>Chuyển khoản ngân hàng</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="momo"
                      checked={form.paymentMethod === 'momo'}
                      onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                      className="mr-2"
                    />
                    <span>Ví MoMo</span>
                  </label>
                </div>
              </div>

              {/* Lưu địa chỉ cho lần sau */}
              {AuthService.getUser()?.id && (
                <div className="flex items-center gap-2">
                  <input
                    id="saveAddress"
                    type="checkbox"
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                  />
                  <label htmlFor="saveAddress" className="text-sm text-gray-700">
                    Lưu địa chỉ này cho lần sau
                  </label>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">
                  Ghi chú
                </label>
                <textarea
                  value={form.note}
                  onChange={(e) => handleInputChange('note', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ghi chú về đơn hàng (không bắt buộc)"
                />
              </div>
            </form>
          </div>

          {/* Phần Voucher */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <VoucherIcon className="mr-2 w-5 h-5" />
              Mã giảm giá & Voucher
              <span className="ml-auto text-sm font-normal text-gray-500">
                {userVouchers.filter(uv => !uv.is_used).length} voucher có sẵn
              </span>
            </h2>
            
            {/* Voucher đã chọn */}
            {selectedVoucher && selectedVoucher.voucher && (
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <CelebrationIcon className="w-6 h-6 text-green-600" />
                      <div className="font-bold text-green-800 text-lg">
                        {selectedVoucher.voucher.name || 'Voucher không tên'}
                      </div>
                    </div>
                    <div className="text-sm text-green-600 mt-1">
                      {selectedVoucher.voucher.description || 'Không có mô tả'}
                    </div>
                    <div className="text-lg text-green-700 font-bold mt-3 flex items-center">
                      <MoneyIcon className="w-5 h-5 mr-1" />
                      <span>Tiết kiệm: {selectedVoucher.voucher.discount_type === 'percentage' 
                        ? `${selectedVoucher.voucher.discount_value || 0}%` 
                        : formatCurrency(selectedVoucher.voucher.discount_value || 0)
                      }</span>
                      {selectedVoucher.voucher.discount_type === 'percentage' && selectedVoucher.voucher.max_discount > 0 && 
                        ` (Tối đa: ${formatCurrency(selectedVoucher.voucher.max_discount)})`
                      }
                    </div>
                    <div className="text-xs text-green-500 mt-2">
                      Mã: <span className="font-mono bg-green-100 px-2 py-1 rounded font-bold">{selectedVoucher.voucher.code}</span>
                    </div>
                  </div>
                  <button
                    onClick={removeVoucher}
                    className="px-4 py-2 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded-lg hover:bg-red-50 transition-colors font-medium flex items-center"
                  >
                    <XIcon className="w-4 h-4 mr-1" />
                    Bỏ chọn
                  </button>
                </div>
              </div>
            )}

            {/* Nhập mã voucher */}
            <div className="mb-6">
              <div className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <SearchIcon className="mr-2 w-5 h-5" />
                Nhập mã voucher:
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={voucherCode}
                  onChange={handleVoucherCodeChange}
                  placeholder="Nhập mã voucher (VD: SALE20)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={applyVoucherByCode}
                  disabled={!voucherCode.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  <RocketIcon className="w-4 h-4 mr-1 inline" />
                  Áp dụng
                </button>
              </div>
            </div>

            {/* Danh sách voucher có sẵn */}
            {voucherLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Đang tải voucher...</p>
              </div>
            ) : userVouchers && userVouchers.length > 0 ? (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <ListIcon className="mr-2 w-5 h-5" />
                  Voucher có sẵn ({userVouchers.filter(uv => !uv.is_used).length} voucher)
                  <span className="ml-auto text-xs text-gray-500">
                    {AuthService.getUser()?.id ? 'Từ admin + đã gán' : 'Từ admin'}
                  </span>
                </div>
                
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
                  
                </div>
                
                <div className="grid gap-3 max-h-50 overflow-y-auto">
                  {userVouchers
                    .filter(uv => !uv.is_used && uv.voucher && 
                      uv.voucher.valid_from && uv.voucher.valid_until && 
                      uv.voucher.min_order_amount !== undefined)
                    .map((userVoucher) => {
                      const { voucher } = userVoucher;
                      if (!voucher || !voucher.valid_from || !voucher.valid_until) return null;
                      
                      try {
                        const isValid = new Date() >= new Date(voucher.valid_from) && 
                                      new Date() <= new Date(voucher.valid_until);
                        const canUse = totalAmount >= voucher.min_order_amount;
                        const isSelected = selectedVoucher?.id === userVoucher.id;
                        
                        return (
                          <div
                            key={userVoucher.id}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50 shadow-md scale-105'
                                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm hover:scale-102'
                            } ${
                              !isValid || !canUse ? 'opacity-60 cursor-not-allowed' : ''
                            }`}
                            onClick={() => {
                              if (isValid && canUse) {
                                setSelectedVoucher(userVoucher);
                                console.log('Selected voucher:', userVoucher);
                              }
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <div className="font-semibold text-gray-900 text-lg">
                                    {voucher.name || 'Voucher không tên'}
                                  </div>
                                  {isSelected && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium animate-pulse">
                                      ✨ Đã chọn
                                    </span>
                                  )}
                                </div>
                                
                                <div className="text-sm text-gray-600 mb-3">
                                  {voucher.description || 'Không có mô tả'}
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 mb-3">
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">Loại giảm giá:</div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {voucher.discount_type === 'percentage' 
                                        ? `${voucher.discount_value || 0}%` 
                                        : formatCurrency(voucher.discount_value || 0)
                                      }
                                    </div>
                                    {voucher.discount_type === 'percentage' && voucher.max_discount > 0 && (
                                      <div className="text-xs text-gray-500">
                                        Tối đa: {formatCurrency(voucher.max_discount)}
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">Điều kiện:</div>
                                    <div className="text-sm font-medium text-gray-900">
                                      Từ {formatCurrency(voucher.min_order_amount || 0)}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <div className="flex items-center space-x-4">
                                    <span>Mã: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{voucher.code}</span></span>
                                    <span>Hạn: {new Date(voucher.valid_until).toLocaleDateString('vi-VN')}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="text-right ml-4">
                                <div className="text-xs font-medium mb-2">
                                  {isValid ? (
                                    canUse ? (
                                      <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full flex items-center">
                                        <CheckIcon className="w-4 h-4 mr-1" />
                                        Có thể sử dụng
                                      </span>
                                    ) : (
                                      <span className="text-orange-600 bg-orange-100 px-2 py-1 rounded-full flex items-center">
                                        <WarningIcon className="w-4 h-4 mr-1" />
                                        Chưa đủ điều kiện
                                      </span>
                                    )
                                  ) : (
                                    <span className="text-red-600 bg-red-100 px-2 py-1 rounded-full flex items-center">
                                      <XIcon className="w-4 h-4 mr-1" />
                                      Hết hạn
                                    </span>
                                    )}
                                </div>
                                
                                {canUse && isValid && !isSelected && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedVoucher(userVoucher);
                                      console.log('Selected voucher via button:', userVoucher);
                                    }}
                                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors font-medium flex items-center"
                                  >
                                    <TargetIcon className="w-4 h-4 mr-1" />
                                    Chọn
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      } catch (error) {
                        console.error('Error rendering voucher:', error, voucher);
                        return null;
                      }
                    }).filter(Boolean)}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <VoucherIcon className="w-16 h-16 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-500 mb-2">Bạn chưa có voucher nào</p>
                <p className="text-sm text-gray-400">Liên hệ admin để được cấp voucher hoặc chờ các chương trình khuyến mãi!</p>
                
                {/* Debug info - tạm thời để test */}
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
                  <strong>Debug Info:</strong> 
                  <br />
                  userVouchers: {userVouchers ? `Array(${userVouchers.length})` : 'null/undefined'}
                  <br />
                  userVouchers.length: {userVouchers?.length || 0}
                  <br />
                  voucherLoading: {voucherLoading.toString()}
                  <br />
                  User ID: {AuthService.getUser()?.id || 'Chưa đăng nhập'}
                  <br />
                  <button 
                    onClick={createSampleVouchers}
                    className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 flex items-center mx-auto"
                  >
                    <SettingsIcon className="w-4 h-4 mr-1" />
                    Tạo voucher mẫu để test
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Thông tin sản phẩm chi tiết */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Chi tiết sản phẩm</h2>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  {/* Ảnh sản phẩm */}
                  <div className="w-16 h-16 rounded overflow-hidden bg-white border">
                    {item.product_img ? (
                      <img
                        src={`http://localhost:3000${item.product_img}`}
                        alt={item.product_img_alt || item.product_name || `Sản phẩm #${item.variant_id}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs bg-gray-100" style={{ display: item.product_img ? 'none' : 'flex' }}>
                      <div className="text-center">
                        <BoxIcon className="w-8 h-8 mx-auto" />
                        <div className="text-xs">IMG</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-medium">
                      {item.product_name || `Sản phẩm #${item.variant_id}`}
                    </div>
                    <div className="text-sm text-gray-500">
                      SKU: {item.variant_sku || item.variant_id} | 
                      Số lượng: {item.quantity}
                      {item.color && (
                        <span className="ml-2">| Màu: {item.color}</span>
                      )}
                      {item.size && (
                        <span className="ml-2">| Size: {item.size}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatCurrency(item.unit_price * item.quantity)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatCurrency(item.unit_price)} / sản phẩm
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tóm tắt đơn hàng */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h2>
            
            {/* Thông tin đơn hàng */}
            <div className="space-y-3 mb-4">
              <div className="text-sm text-gray-600">
                <div>Số sản phẩm: {cartItems.length}</div>
                <div>Tổng số lượng: {cartItems.reduce((sum, item) => sum + item.quantity, 0)}</div>
              </div>
              
              {/* Danh sách sản phẩm tóm tắt */}
              <div className="border-t pt-3">
                <div className="text-sm font-medium text-gray-700 mb-2">Sản phẩm đã chọn:</div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-2 text-xs">
                      <div className="w-8 h-8 rounded overflow-hidden bg-gray-100 border">
                        {item.product_img ? (
                          <img
                            src={`http://localhost:3000${item.product_img}`}
                            alt={item.product_img_alt || item.product_name || `Sản phẩm #${item.variant_id}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs" style={{ display: item.product_img ? 'none' : 'flex' }}>
                          <BoxIcon className="w-6 h-6" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {item.product_name || `Sản phẩm #${item.variant_id}`}
                        </div>
                        <div className="text-gray-500">
                          {item.quantity}x {formatCurrency(item.unit_price)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
              
              {/* Voucher discount */}
              {selectedVoucher && selectedVoucher.voucher && (
                <>
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá voucher</span>
                    <span>-{formatCurrency(voucherDiscount)}</span>
                  </div>
                  <div className="text-xs text-gray-500 bg-green-50 p-2 rounded border border-green-200">
                    <div className="font-medium text-green-800 mb-1 flex items-center">
                      <VoucherIcon className="w-4 h-4 mr-1" />
                      {selectedVoucher.voucher.name}
                    </div>
                    <div className="text-green-700">
                      {selectedVoucher.voucher.discount_type === 'percentage' 
                        ? `Giảm ${selectedVoucher.voucher.discount_value}%`
                        : `Giảm ${formatCurrency(selectedVoucher.voucher.discount_value)}`
                      }
                      {selectedVoucher.voucher.discount_type === 'percentage' && selectedVoucher.voucher.max_discount > 0 && 
                        ` (Tối đa: ${formatCurrency(selectedVoucher.voucher.max_discount)})`
                      }
                    </div>
                    <div className="text-green-600 text-xs mt-1">
                      Mã: {selectedVoucher.voucher.code}
                    </div>
                  </div>
                </>
              )}
              
              <div className="flex justify-between">
                <span>Phí vận chuyển</span>
                <span className={shippingFee === 0 ? 'text-green-600' : ''}>
                  {shippingFee === 0 ? 'Miễn phí' : formatCurrency(shippingFee)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Thuế VAT (10%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Tổng cộng</span>
                  <span className="text-blue-600">{formatCurrency(finalTotal)}</span>
                </div>
                {selectedVoucher && selectedVoucher.voucher && (
                  <div className="text-xs text-green-600 text-center mt-2 flex items-center justify-center">
                    <MoneyIcon className="w-4 h-4 mr-1" />
                    <span>Tiết kiệm được: {formatCurrency(voucherDiscount)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Thông tin giao hàng tóm tắt */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Địa chỉ giao hàng</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div>{form.fullName || 'Chưa nhập'}</div>
                <div>{form.phone || 'Chưa nhập'}</div>
                <div>{form.address || 'Chưa nhập'}</div>
                <div>{[form.ward, form.district, form.city].filter(Boolean).join(', ') || 'Chưa nhập'}</div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={submitting || !form.fullName || !form.email || !form.phone || !form.address || !form.city || !form.district}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-semibold"
              >
                {submitting ? 'Đang xử lý...' : 'Đặt hàng'}
              </button>
              
              <button
                onClick={() => navigate('/cart')}
                className="w-full py-2 text-blue-600 hover:text-blue-800 text-sm border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Quay lại giỏ hàng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 