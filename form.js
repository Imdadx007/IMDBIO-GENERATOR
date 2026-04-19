// Form JavaScript for Bio Data Form
// Add interactive functionality and validation

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const submitBtn = document.querySelector('button[type="submit"]');

    // Add loading state to button
    function setLoading(loading) {
        if (loading) {
            submitBtn.innerHTML = '<span>Submitting...</span>';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';
        } else {
            submitBtn.innerHTML = 'Submit Bio Data';
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
        }
    }

    // Real-time validation for email
    const emailInput = document.getElementById('email');
    const photoInput = document.getElementById('photo');

    emailInput.addEventListener('blur', function() {
        const email = this.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (email && !emailRegex.test(email)) {
            showError(this, 'Please enter a valid email address');
        } else {
            clearError(this);
        }
    });

    // Real-time validation for phone
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('blur', function() {
        const phone = this.value;
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;

        if (phone && !phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
            showError(this, 'Please enter a valid phone number');
        } else {
            clearError(this);
        }
    });

    // GPA validation
    const gpaInput = document.getElementById('gpa');
    gpaInput.addEventListener('input', function() {
        const gpa = parseFloat(this.value);
        if (gpa < 0 || gpa > 10) {
            showError(this, 'GPA must be between 0 and 10');
        } else {
            clearError(this);
        }
    });

    // Show error message
    function showError(element, message) {
        clearError(element);

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: #e74c3c;
            font-size: 0.9rem;
            margin-top: -10px;
            margin-bottom: 15px;
            animation: slideDown 0.3s ease;
        `;

        element.parentNode.insertBefore(errorDiv, element.nextSibling);
        element.style.borderColor = '#e74c3c';
    }

    // Clear error message
    function clearError(element) {
        const errorMsg = element.parentNode.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.remove();
        }
        element.style.borderColor = '#e1e8ed';
    }

    // Add success animation to inputs
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.style.transform = 'scale(1.02)';
            this.style.transition = 'transform 0.2s ease';
        });

        input.addEventListener('blur', function() {
            this.style.transform = 'scale(1)';
        });

        // Smart auto-capitalize: capitalize only first letter of each word
        if (input.type === 'text' || input.tagName === 'TEXTAREA') {
            input.addEventListener('input', function() {
                const words = this.value.split(' ');
                const capitalized = words.map(word => {
                    if (word.length === 0) return word;
                    return word.charAt(0).toUpperCase() + word.slice(1);
                }).join(' ');
                this.value = capitalized;
            });
        }
    });

    // Form submission handler
    form.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent actual submission

        // Validate all required fields
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                showError(field, 'This field is required');
                isValid = false;
            }
        });

        // Check gender selection
        const genderSelected = document.querySelector('input[name="gender"]:checked');
        if (!genderSelected) {
            const genderGroup = document.querySelector('.radio-group');
            showError(genderGroup.querySelector('input'), 'Please select your gender');
            isValid = false;
        }

        // Check declaration checkbox
        const declaration = document.getElementById('declaration');
        if (!declaration.checked) {
            showError(declaration, 'Please check the declaration');
            isValid = false;
        }

        if (isValid) {
            setLoading(true);

            const photoFile = photoInput.files[0];
            const finalize = (photoDataUrl) => {
                generateBioDataPDF(photoDataUrl);
                setLoading(false);
                // Don't reset form - show edit options instead
                showEditOptions();
            };

            if (photoFile) {
                readPhotoFile(photoFile)
                    .then(finalize)
                    .catch(() => finalize(null));
            } else {
                setTimeout(() => finalize(null), 500);
            }
        } else {
            // Scroll to first error
            const firstError = document.querySelector('.error-message');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });

    // Read photo file as data URL
    function readPhotoFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(event) {
                resolve(event.target.result);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Generate Bio Data PDF
    function generateBioDataPDF(photoDataUrl) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Set font
        doc.setFont("helvetica", "normal");

        // Colors
        const primaryColor = [46, 125, 50]; // Green
        const secondaryColor = [33, 33, 33]; // Dark gray
        const lightGray = [200, 200, 200];

        // Header
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, 210, 30, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text("MY BIO DATA", 105, 20, { align: 'center' });
        doc.setFontSize(10);
        doc.text("One-page professional bio data summary", 105, 27, { align: 'center' });
        doc.setDrawColor(...secondaryColor);
        doc.setLineWidth(0.5);
        doc.line(15, 32, 195, 32);
        doc.setDrawColor(178, 190, 195);
        doc.setLineWidth(0.35);
        doc.rect(10, 44, 190, 232, 'S');

        if (photoDataUrl) {
            const imgFormat = photoDataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG';
            const imgX = 147;
            const imgY = 50;
            const imgW = 45;
            const imgH = 56;
            doc.addImage(photoDataUrl, imgFormat, imgX, imgY, imgW, imgH);
            doc.setDrawColor(120, 130, 145);
            doc.setLineWidth(0.7);
            doc.rect(imgX - 2, imgY - 2, imgW + 4, imgH + 4, 'S');
        }

        let yPosition = 54;

        // Personal Information Section
        doc.setFillColor(...lightGray);
        doc.rect(10, yPosition - 5, 135, 8, 'F');

        doc.setTextColor(...secondaryColor);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("PERSONAL INFORMATION", 15, yPosition);

        yPosition += 15;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);

        // Get form values
        const fullName = document.getElementById('fullName').value;
        const fatherName = document.getElementById('fatherName').value;
        const dob = document.getElementById('dob').value;
        const gender = document.querySelector('input[name="gender"]:checked')?.value || '';
        const address = document.getElementById('address').value;
        const phone = document.getElementById('phone').value;
        const email = document.getElementById('email').value;

        doc.setFont("helvetica", "bold");
        doc.text(`Full Name:`, 15, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text(fullName, 55, yPosition);
        yPosition += 8;

        doc.setFont("helvetica", "bold");
        doc.text(`Father's Name:`, 15, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text(fatherName, 55, yPosition);
        yPosition += 8;

        doc.setFont("helvetica", "bold");
        doc.text(`Date of Birth:`, 15, yPosition);
        doc.setFont("helvetica", "normal");
        const formattedDOB = dob ? new Date(dob).toLocaleDateString() : '';
        doc.text(`${formattedDOB}`, 55, yPosition);
        yPosition += 8;

        doc.setFont("helvetica", "bold");
        doc.text(`Gender:`, 15, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text(`${gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : ''}`, 55, yPosition);
        yPosition += 8;

        // Address (multi-line)
        doc.setFont("helvetica", "bold");
        doc.text(`Address:`, 15, yPosition);
        doc.setFont("helvetica", "normal");
        const addressLines = doc.splitTextToSize(address, 140);
        doc.text(addressLines, 55, yPosition);
        yPosition += addressLines.length * 6 + 2;

        doc.setFont("helvetica", "bold");
        doc.text(`Phone:`, 15, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text(phone, 55, yPosition);
        yPosition += 8;

        doc.setFont("helvetica", "bold");
        doc.text(`Email:`, 15, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text(email, 55, yPosition);
        yPosition += 15;

        // Academic Information Section
        doc.setFillColor(...lightGray);
        doc.rect(10, yPosition - 5, 135, 8, 'F');

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("ACADEMIC INFORMATION", 15, yPosition);

        yPosition += 15;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);

        const collegeName = document.getElementById('collegeName').value;
        const course = document.getElementById('course').value;
        const yearOfStudy = document.getElementById('yearOfStudy').value;
        const rollNumber = document.getElementById('rollNumber').value;
        const gpa = document.getElementById('gpa').value;
        const previousEducation = document.getElementById('previousEducation').value;

        doc.setFont("helvetica", "bold");
        doc.text(`College Name:`, 15, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text(collegeName, 55, yPosition);
        yPosition += 8;

        doc.setFont("helvetica", "bold");
        doc.text(`Course/Program:`, 15, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text(course, 55, yPosition);
        yPosition += 8;

        doc.setFont("helvetica", "bold");
        doc.text(`Year of Study:`, 15, yPosition);
        doc.setFont("helvetica", "normal");
        const yearOrdinal = yearOfStudy === '1' ? 'st' : yearOfStudy === '2' ? 'nd' : yearOfStudy === '3' ? 'rd' : 'th';
        doc.text(`${yearOfStudy}${yearOrdinal} Year`, 55, yPosition);
        yPosition += 8;

        doc.setFont("helvetica", "bold");
        doc.text(`Roll Number/ID:`, 15, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text(rollNumber, 55, yPosition);
        yPosition += 8;

        doc.setFont("helvetica", "bold");
        doc.text(`Current GPA/CGPA:`, 15, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text(`${gpa}/10`, 55, yPosition);
        yPosition += 8;

        // Previous Education (multi-line)
        doc.setFont("helvetica", "bold");
        doc.text(`Previous Education:`, 15, yPosition);
        doc.setFont("helvetica", "normal");
        const educationLines = doc.splitTextToSize(previousEducation, 140);
        if (yPosition + educationLines.length * 6 > 270) {
            doc.addPage();
            yPosition = 20;
        }
        doc.text(educationLines, 55, yPosition);
        yPosition += educationLines.length * 6 + 2;

        // Additional Information Section
        if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
        }

        doc.setFillColor(...lightGray);
        doc.rect(10, yPosition - 5, 135, 8, 'F');

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("ADDITIONAL INFORMATION", 15, yPosition);

        yPosition += 15;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);

        const hobbies = document.getElementById('hobbies').value;
        const skills = document.getElementById('skills').value;
        const emergencyContact = document.getElementById('emergencyContact').value;
        const emergencyPhone = document.getElementById('emergencyPhone').value;

        if (hobbies) {
            doc.setFont("helvetica", "bold");
            doc.text(`Hobbies:`, 15, yPosition);
            doc.setFont("helvetica", "normal");
            const hobbiesLines = doc.splitTextToSize(hobbies, 140);
            doc.text(hobbiesLines, 55, yPosition);
            yPosition += hobbiesLines.length * 6 + 2;
        }

        if (skills) {
            doc.setFont("helvetica", "bold");
            doc.text(`Skills:`, 15, yPosition);
            doc.setFont("helvetica", "normal");
            const skillsLines = doc.splitTextToSize(skills, 140);
            doc.text(skillsLines, 55, yPosition);
            yPosition += skillsLines.length * 6 + 2;
        }

        doc.setFont("helvetica", "bold");
        doc.text(`Emergency Contact:`, 15, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text(emergencyContact, 55, yPosition);
        yPosition += 8;

        doc.setFont("helvetica", "bold");
        doc.text(`Emergency Phone:`, 15, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text(emergencyPhone, 55, yPosition);
        yPosition += 15;

        // Footer - ensure it fits on page
        if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
        }
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        const timestamp = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
        doc.text(`Created by IMDBIO GENERATOR on ${timestamp}`, 105, yPosition + 10, { align: 'center' });

        // Save the PDF
        const fileName = `${fullName.replace(/\s+/g, '_')}_BioData.pdf`;
        doc.save(fileName);

        // Show success message
        showSuccessMessage();
    }

    // Show success message
    function showSuccessMessage() {
        // Create success overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease;
        `;

        const message = document.createElement('div');
        message.style.cssText = `
            background: linear-gradient(45deg, #27ae60, #2ecc71);
            color: white;
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            animation: slideUp 0.5s ease;
            max-width: 400px;
        `;

        message.innerHTML = `
            <h2 style="margin: 0 0 20px 0; font-size: 2rem;">✅ PDF Generated!</h2>
            <p style="margin: 0; font-size: 1.1rem;">Your bio data PDF has been downloaded successfully!</p>
        `;

        overlay.appendChild(message);
        document.body.appendChild(overlay);

        // Remove after 3 seconds
        setTimeout(() => {
            overlay.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(overlay);
            }, 300);
        }, 3000);
    }

    // Show edit options after PDF generation
    function showEditOptions() {
        // Create edit options overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease;
        `;

        const message = document.createElement('div');
        message.style.cssText = `
            background: linear-gradient(45deg, #27ae60, #2ecc71);
            color: white;
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            animation: slideUp 0.5s ease;
            max-width: 450px;
        `;

        message.innerHTML = `
            <h2 style="margin: 0 0 20px 0; font-size: 2rem;">✅ PDF Generated!</h2>
            <p style="margin: 0 0 30px 0; font-size: 1.1rem;">Your bio data PDF has been downloaded successfully!</p>
            <div style="display: flex; gap: 15px; justify-content: center;">
                <button id="editBtn" style="
                    background: #3498db;
                    color: white;
                    border: none;
                    padding: 12px 25px;
                    border-radius: 8px;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">✏️ Edit Form</button>
                <button id="downloadAgainBtn" style="
                    background: #e74c3c;
                    color: white;
                    border: none;
                    padding: 12px 25px;
                    border-radius: 8px;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">📥 Download Again</button>
            </div>
        `;

        overlay.appendChild(message);
        document.body.appendChild(overlay);

        // Add event listeners to buttons
        document.getElementById('editBtn').addEventListener('click', function() {
            overlay.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(overlay);
            }, 300);
        });

        document.getElementById('downloadAgainBtn').addEventListener('click', function() {
            overlay.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(overlay);
                // Generate PDF again with current data
                const photoFile = photoInput.files[0];
                const finalize = (photoDataUrl) => {
                    generateBioDataPDF(photoDataUrl);
                };

                if (photoFile) {
                    readPhotoFile(photoFile)
                        .then(finalize)
                        .catch(() => finalize(null));
                } else {
                    finalize(null);
                }
            }, 300);
        });
    }

    // Add smooth scrolling for better UX
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add keyboard navigation improvements
    document.addEventListener('keydown', function(e) {
        // Ctrl + Enter to submit form
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            form.dispatchEvent(new Event('submit'));
        }
    });

    // Add dynamic year validation
    const yearSelect = document.getElementById('yearOfStudy');
    const currentYear = new Date().getFullYear();

    // Add current year option if not present
    if (!Array.from(yearSelect.options).some(option => option.value === currentYear.toString())) {
        const currentOption = document.createElement('option');
        currentOption.value = currentYear;
        currentOption.textContent = `Current Year (${currentYear})`;
        yearSelect.appendChild(currentOption);
    }

    // Add some fun animations on page load
    const fieldsets = document.querySelectorAll('fieldset');
    fieldsets.forEach((fieldset, index) => {
        fieldset.style.animationDelay = `${index * 0.2}s`;
    });

    console.log('Bio Data Form JavaScript loaded successfully!');
});