$(document).ready(function(){
    // 1. HIỆU ỨNG CUỘN MƯỢT (SMOOTH SCROLL)

$(".navbar a, footer a[href='#main-navbar']").on('click', function(event) {
        if (this.hash !== "") {
            var target = $(this.hash);
            
            // Kiểm tra xem đích đến có tồn tại trên trang hiện tại không
            if (target.length) {
                // Nếu tồn tại (đang ở trang chủ), ngăn chuyển trang và cuộn mượt
                event.preventDefault();
                var hash = this.hash;
                $('html, body').animate({
                    scrollTop: target.offset().top - 80
                }, 900, function(){
                    window.location.hash = hash;
                });
            }
            // Nếu không tồn tại (đang ở trang about), JS sẽ không làm gì cả
            // Trình duyệt sẽ tự động load sang index.html theo href 
        }
    });

    // 2. TỰ ĐỘNG CHỌN DỊCH VỤ TRONG MODAL FORM

    // Khi click vào button tương ứng sẽ Checked vào checkbox tương ứng trong list checkbox
    $('.btn-buy').on('click', function() {
        // Lấy ID của combo từ thuộc tính data-combo của nút được bấm
        var comboId = $(this).attr('data-combo'); 
        
        // Bỏ chọn tất cả các checkbox trước để tránh bị trùng lặp nếu khách đổi ý
        $('#orderForm input[type="checkbox"]').prop('checked', false); 
        
        // Đánh dấu check vào đúng combo đã chọn
        $('#' + comboId).prop('checked', true); 
    });


    // 4. KIỂM TRA RÀNG BUỘC 
    $('#contactForm').on('submit', function(event) {
        event.preventDefault(); // Ngăn trang tự động tải lại khi bấm Submit
        
        var contactName = $('#contactName').val().trim();
        var contactEmail = $('#contactEmail').val().trim();
        var contactMessage = $('#contactMessage').val().trim();

        // Ràng buộc: Email bắt buộc phải có
        if(contactEmail === "") {
            alert("Vui lòng nhập Email liên hệ!");
            return false;
        }

        // Ràng buộc: Name không chứa ký tự số
        var hasNumber = /\d/; // Biểu thức  kiểm tra số
        if (hasNumber.test(contactName)) {
            alert("Tên khách hàng không được chứa ký tự số!");
            return false;
        }

        // Ràng buộc: Nội dung phải có độ dài tối thiểu là 20
        if (contactMessage.length < 20) {
            alert("Nội dung tin nhắn phải có ít nhất 20 ký tự (Hiện tại: " + contactMessage.length + " ký tự).");
            return false;
        }

        alert("Tin nhắn của bạn đã được gửi thành công tới FastFood!");
        $('#contactForm')[0].reset();
    });

    // 5. HỆ THỐNG GIỎ HÀNG 
    // A. KHI BẤM "ĐẶT NGAY" HOẶC "THÊM VÀO GIỎ HÀNG"
    $('.btn-add-cart').click(function(e) {
        e.preventDefault(); // Ngăn trình duyệt nhảy trang
        
        // 1. Lấy thông tin món ăn từ nút bấm
        var item = {
            name: $(this).data('name'),
            price: $(this).data('price'),
            img: $(this).data('img'),
            qty: 1
        };

        // 2. Mở bộ nhớ trình duyệt lấy giỏ hàng cũ ra (nếu không có thì tạo giỏ trống)
        var cart = JSON.parse(localStorage.getItem('fastfood_cart')) || [];
        
        // 3. KIỂM TRA MÓN ĂN ĐÃ TỒN TẠI TRONG GIỎ CHƯA
        // Hàm findIndex sẽ quét xem có món nào trùng tên không
        var existingItemIndex = cart.findIndex(function(cartItem) {
            return cartItem.name === item.name;
        });

        if (existingItemIndex !== -1) {
            // NẾU ĐÃ CÓ RỒI: Thay vì thêm dòng mới, ta chỉ tăng số lượng (qty) lên 1
            cart[existingItemIndex].qty += 1;
        } else {
            // NẾU CHƯA CÓ: Mới cho phép thêm thành một dòng mới
            cart.push(item);
        }
        
        // 4. Lưu lại cập nhật vào bộ nhớ
        localStorage.setItem('fastfood_cart', JSON.stringify(cart));
        
        // 5. Lái xe sang trang giỏ hàng
        window.location.href = 'cart.html';
    });

    // B. HIỂN THỊ GIỎ HÀNG (Khi mở trang cart.html)
    function loadCart() {
        // Nếu không có cái hộp này (tức là đang ở trang chủ), thì không làm gì cả
        if ($('#cart-items-container').length === 0) return; 

        var cart = JSON.parse(localStorage.getItem('fastfood_cart')) || [];
        var container = $('#cart-items-container');
        container.empty(); // Xóa sạch HTML cũ

        // Nếu giỏ trống
        if (cart.length === 0) {
            $('#cart-content').hide();
            $('#empty-cart-msg').fadeIn();
            return;
        }

        $('#cart-content').show();
        $('#empty-cart-msg').hide();

        // Lặp qua từng món trong bộ nhớ và in ra màn hình
        cart.forEach(function(item, index) {
            var html = `
            <div class="panel panel-default cart-item" data-index="${index}">
                <div class="panel-body row" style="display: flex; align-items: center;">
                    <div class="col-xs-3">
                        <img src="${item.img}" class="img-responsive img-rounded" alt="Ảnh món">
                    </div>
                    <div class="col-xs-4">
                        <h4 style="font-weight: bold; margin-top: 0;">${item.name}</h4>
                        <a href="#" class="text-danger btn-remove" style="font-size: 12px;">Xóa</a>
                    </div>
                    <div class="col-xs-2 text-center">
                        <input type="number" class="form-control item-qty" value="${item.qty}" min="1">
                    </div>
                    <div class="col-xs-3 text-right">
                        <h4 style="font-weight: bold;" class="item-price" data-price="${item.price}">${(item.price * item.qty).toLocaleString('vi-VN')}đ</h4>
                    </div>
                </div>
            </div>`;
            container.append(html); 
        });

        calculateCart(); 
    }


    // C. MÁY TÍNH TIỀN
    function calculateCart() {
        var grandTotal = 0;
        $('.cart-item').each(function() {
            var price = parseInt($(this).find('.item-price').attr('data-price'));
            var qty = parseInt($(this).find('.item-qty').val());
            if (isNaN(qty) || qty < 1) { qty = 1; $(this).find('.item-qty').val(1); }
            
            var lineTotal = price * qty;
            $(this).find('.item-price').text(lineTotal.toLocaleString('vi-VN') + 'đ');
            grandTotal += lineTotal;
            
            // Cập nhật lại số lượng vào bộ nhớ
            var index = $(this).data('index');
            var cart = JSON.parse(localStorage.getItem('fastfood_cart')) || [];
            if(cart[index]) {
                cart[index].qty = qty;
                localStorage.setItem('fastfood_cart', JSON.stringify(cart));
            }
        });

        $('#sub-total').text(grandTotal.toLocaleString('vi-VN') + 'đ');
        $('#grand-total').text(grandTotal.toLocaleString('vi-VN') + 'đ');
    }

    // D. CHẠY HỆ THỐNG KHI LOAD TRANG
    $(document).ready(function() {
        loadCart();
    });

    // E. SỰ KIỆN XÓA VÀ ĐỔI SỐ LƯỢNG
    $(document).on('click', '.btn-remove', function(e) {
        e.preventDefault();
        var index = $(this).closest('.cart-item').data('index');
        
        // Xóa món đó khỏi bộ nhớ
        var cart = JSON.parse(localStorage.getItem('fastfood_cart')) || [];
        cart.splice(index, 1);
        localStorage.setItem('fastfood_cart', JSON.stringify(cart));
        loadCart(); 
    });

    $(document).on('change keyup', '.item-qty', function() {
        calculateCart();
    });

    // 1. Hàm đếm số lượng
    function updateCartBadge() {
        var cart = JSON.parse(localStorage.getItem('fastfood_cart')) || [];
        var totalItems = 0;
        
        cart.forEach(function(item) {
            totalItems += parseInt(item.qty);
        });
        $('#cart-count').text(totalItems);
    }
    $(document).ready(function() {
        updateCartBadge();
    });
});