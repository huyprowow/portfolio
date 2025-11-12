vec3 directionalLight(vec3 lightColor, float lightIntensity, vec3 normal, vec3 lightPosition, vec3 viewDirection, float specularPower) {

    vec3 lightDirection = normalize(lightPosition);
    vec3 lightReflection = reflect(-lightDirection, normal);// dao chieu light direction toi be mat vat the

    //shading
    float shading = dot(normal, lightDirection);
    shading = max(shading, 0.0);

    //specular
    float specular = -dot(lightReflection, viewDirection);//dao sau khi tinh tich vo huong
    specular = max(0.0, specular);
    specular = pow(specular, specularPower);

    return lightColor * lightIntensity * (shading+ specular);
}
