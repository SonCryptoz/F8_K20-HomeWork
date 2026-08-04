const utmSource = document.querySelector(".utm_source")
const utmCampaign = document.querySelector(".utm_campaign");

const params = new URLSearchParams(location.search);

utmSource.textContent = location.search ? params.get("utm_source") : "Không có tham số quảng cáo";
utmCampaign.textContent = location.search ? params.get("utm_campaign") : "Không có tham số quảng cáo";