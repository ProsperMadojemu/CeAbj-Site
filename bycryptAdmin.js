const bcrypt = require('bcryptjs');

const bcryptConvert = async (req, res) => {
    var admin = 'ceabaranje@admin234';
    
    try {
        const hashedPassword = await bcrypt.hash(admin, 10); 

        console.log(hashedPassword);

        return hashedPassword;
    } catch (error) {
        console.error('Error hashing password:', error);
    }
}

bcryptConvert();