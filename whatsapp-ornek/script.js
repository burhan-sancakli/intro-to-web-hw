const sendButton = document.getElementById('sendButton');
const datePicker = document.getElementById('datePicker');

function formatDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}.${month}.${year}`;
}

sendButton.addEventListener('click', () => {
    const selectedDate = datePicker.value;
    if (selectedDate !== "") {
        const formattedDate = formatDate(selectedDate);
        const encodedText = encodeURIComponent(`I want to set an appointment on ${formattedDate}.`);
        const whatsappLink = `https://wa.me/+905050708782?text=${encodedText}`;
        window.location.href = whatsappLink;
    }
});