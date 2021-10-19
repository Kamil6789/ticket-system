const getTicketStatus = (status) => {
    switch (status) {
        case 0: return 'nowe';
        case 1: return 'w trakcie przeglądu';
        case 2: return 'rozpatrzone';
        default: return '';
    }
}

module.exports = {
    getTicketStatus
}